export async function initializeTransaction(params: {
  amount: number; // in cents
  email: string;
  reference: string;
  callback_url: string;
  metadata?: any;
}) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not defined");
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      email: params.email,
      reference: params.reference,
      callback_url: params.callback_url,
      metadata: params.metadata,
      currency: "ZAR",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to initialize Paystack transaction");
  }

  return data;
}
