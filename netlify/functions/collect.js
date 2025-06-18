// netlify/functions/collect.js

export async function handler(event) {
  const clientId = event.queryStringParameters.client_id;
  const effectiveClientId = clientId || crypto.randomUUID();
  const payload = {
    client_id: effectiveClientId,
    events: [{ name: "page_view" }]
  };
  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=G-LKLBT4Z5XG&api_secret=6wzs8wmxRtKdQznxUvY4Fg`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  return { statusCode: 204 };
}
