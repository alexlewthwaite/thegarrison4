// Creates a SumUp checkout for a gift voucher and stores the order details
// so the webhook can email the venue once payment is confirmed.
import { getStore } from "@netlify/blobs";

const ALLOWED_AMOUNTS = [50, 75, 100];
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Netlify.env.get("SUMUP_API_KEY");
  const merchantCode = Netlify.env.get("SUMUP_MERCHANT_CODE");
  if (!apiKey || !merchantCode) return json({ error: "Payments are not configured yet." }, 500);

  let b;
  try { b = await req.json(); } catch { return json({ error: "Bad request" }, 400); }

  const amount = Number(b.amount);
  const order = {
    amount,
    buyerName: clean(b.buyerName, 80),
    buyerEmail: clean(b.buyerEmail, 120),
    recipientName: clean(b.recipientName, 80),
    message: clean(b.message, 300),
  };
  if (!ALLOWED_AMOUNTS.includes(amount)) return json({ error: "Please choose £50, £75 or £100." }, 400);
  if (!order.buyerName || !order.recipientName) return json({ error: "Please enter your name and the recipient's name." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.buyerEmail)) return json({ error: "Please enter a valid email address." }, 400);

  const siteUrl = (Netlify.env.get("URL") || new URL(req.url).origin).replace(/\/$/, "");
  const reference = ("GV-" + Date.now().toString(36) + "-" + crypto.randomUUID().slice(0, 8)).slice(0, 64);

  const res = await fetch("https://api.sumup.com/v0.1/checkouts", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      checkout_reference: reference,
      amount,
      currency: "GBP",
      merchant_code: merchantCode,
      description: `Garrison gift voucher £${amount} - for ${order.recipientName}`.slice(0, 120),
      return_url: `${siteUrl}/.netlify/functions/sumup-webhook`,
      redirect_url: `${siteUrl}/?voucher=return#vouchers`,
    }),
  });
  if (!res.ok) {
    console.error("SumUp create checkout failed", res.status, await res.text());
    return json({ error: "Sorry, we couldn't start the payment. Please try again." }, 502);
  }
  const checkout = await res.json();

  await getStore("voucher-orders").setJSON(checkout.id, {
    ...order, reference, merchantCode, createdAt: new Date().toISOString(), notified: false,
  });

  return json({ checkoutId: checkout.id, amount });
};
