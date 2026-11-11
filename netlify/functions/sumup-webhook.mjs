// SumUp calls this when a checkout changes status. We never trust the call itself:
// we re-fetch the checkout from SumUp, and only if it is PAID (and matches the order
// we stored) do we send the order to the venue via a Netlify Form (-> email).
import { getStore } from "@netlify/blobs";

const ok = () => new Response("", { status: 200 });

export default async (req) => {
  if (req.method !== "POST") return new Response("", { status: 405 });
  let body;
  try { body = await req.json(); } catch { return ok(); }
  if (body.event_type !== "CHECKOUT_STATUS_CHANGED" || !body.id) return ok();

  const apiKey = Netlify.env.get("SUMUP_API_KEY");
  const store = getStore("voucher-orders");
  const order = await store.get(body.id, { type: "json" });
  if (!order) return ok();            // not one of ours
  if (order.notified) return ok();    // already handled (SumUp can resend)

  const res = await fetch(`https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(body.id)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return new Response("", { status: 502 });   // non-2xx => SumUp retries
  const checkout = await res.json();

  if (checkout.status !== "PAID") return ok();
  if (Number(checkout.amount) !== Number(order.amount) || checkout.currency !== "GBP"
      || checkout.merchant_code !== order.merchantCode) {
    console.error("Checkout does not match stored order", body.id);
    return ok();
  }

  const siteUrl = (Netlify.env.get("URL") || "").replace(/\/$/, "");
  const form = new URLSearchParams({
    "form-name": "voucher-order",
    amount: `£${order.amount}`,
    "recipient-name": order.recipientName,
    "buyer-name": order.buyerName,
    "buyer-email": order.buyerEmail,
    message: order.message || "",
    "sumup-checkout-id": body.id,
    reference: order.reference,
    "paid-at": new Date().toISOString(),
  });
  const post = await fetch(`${siteUrl}/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!post.ok) { console.error("Form post failed", post.status); return new Response("", { status: 502 }); }

  await store.setJSON(body.id, { ...order, notified: true });
  return ok();
};
