// netlify/functions/collect.js
export async function handler(event) {
  const clientId = event.queryStringParameters.client_id;
  const effectiveClientId = clientId || crypto.randomUUID();
  const payload = {
    client_id: effectiveClientId,
    events: [{ name: "page_view" }]
  };

  // debug 엔드포인트
  const url = `https://www.google-analytics.com/mp/debug/collect
    ?measurement_id=G-LKLB T4Z5XG
    &api_secret=6wzs8wmxRtKdQznxUvY4Fg`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await resp.text();
  console.log("GA Debug response:", text);

  // 브라우저로도 JSON이 보이게 돌려주기
  return {
    statusCode: resp.status,
    body: text,
    headers: { "Content-Type": "application/json" }
  };
}
