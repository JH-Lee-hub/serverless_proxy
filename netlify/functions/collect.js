// netlify/functions/collect.js
import crypto from "crypto";

export async function handler(event) {
  // 1) data 파라미터 하나로 읽어오기 (URL-encoded JSON)
  const raw = event.queryStringParameters?.data;
  if (!raw) {
    return { statusCode: 400, body: "Missing data param" };
  }

  // 2) 디코딩 → JSON.parse
  let payload;
  try {
    payload = JSON.parse(decodeURIComponent(raw));
  } catch (e) {
    return { statusCode: 400, body: "Invalid data JSON" };
  }

  // 3) client_id가 비어 있으면 생성 (고유 사용자 식별)
  payload.client_id = payload.client_id || crypto.randomUUID();

  // 4) session_id가 비어 있으면 생성 (세션 식별)
  payload.session_id = payload.session_id || crypto.randomUUID();

  // 5) GA4 Measurement Protocol collect 엔드포인트 (한 줄, 공백·줄바꿈 금지)
  const url =
    "https://www.google-analytics.com/mp/collect" +
    "?measurement_id=G-LKLBT4Z5XG" +
    "&api_secret=6wzs8wmxRtKdQznxUvY4Fg";

  // 6) POST 요청으로 payload 전송
  let status;
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    status = resp.status;
  } catch (e) {
    console.error("Error sending to GA4 MP:", e);
    // GA 전송 중 에러라면 502 로 응답
    return { statusCode: 502, body: "Bad Gateway" };
  }

  // 7) Netlify 함수는 GA의 상태 코드를 그대로 반환
  return { statusCode: status };
}
