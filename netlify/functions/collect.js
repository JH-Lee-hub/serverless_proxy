// netlify/functions/collect.js
import crypto from "crypto";

export async function handler(event) {
  // 1) client_id 쿼리파라미터에서 읽어오거나 새로 생성
  const clientId = event.queryStringParameters.client_id;
  const effectiveClientId = clientId || crypto.randomUUID();

  // 2) GA Measurement Protocol용 payload 구성
  const payload = {
    client_id: effectiveClientId,
    events: [{ name: "page_view" }],
  };

  // 3) 실제 수집용 엔드포인트
  const url = `https://www.google-analytics.com/mp/collect` +
    `?measurement_id=G-LKLB T4Z5XG` +
    `&api_secret=6wzs8wmxRtKdQznxUvY4Fg`;

  // 4) POST 요청
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // 5) Netlify 함수는 204 No Content를 반환
  return {
    statusCode: 204,
    body: "",
  };
}
