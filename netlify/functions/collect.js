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
  const effectiveClientId = payload.client_id || crypto.randomUUID();
  payload.client_id = effectiveClientId;

  // 4) MP collect용 올바른 URL (한 줄, 공백·줄바꿈 금지)
  const url =
    "https://www.google-analytics.com/mp/collect" +
    "?measurement_id=G-LKLBT4Z5XG" +
    "&api_secret=6wzs8wmxRtKdQznxUvY4Fg";

  // 5) 이 url 변수를 실제로 사용
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // 6) Netlify 함수는 204를 반환
  return { statusCode: resp.status };
}
