import crypto from "crypto";

export async function handler(event) {
  // 1) data 파라미터 하나로 읽어오기
  const raw = event.queryStringParameters.data;
  if (!raw) {
    return { statusCode: 400, body: "Missing data param" };
  }

  // 2) decodeURIComponent → JSON.parse
  let payload;
  try {
    payload = JSON.parse(decodeURIComponent(raw));
  } catch (e) {
    return { statusCode: 400, body: "Invalid data JSON" };
  }

  // 3) client_id가 비어 있으면 생성
  const effectiveClientId =
    payload.client_id || crypto.randomUUID();
  payload.client_id = effectiveClientId;

  // 4) MP 호출
  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=G-LKLB T4Z5XG&api_secret=6wzs8wmxRtKdQznxUvY4Fg`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  // 5) 204로 응답
  return { statusCode: 204 };
}
