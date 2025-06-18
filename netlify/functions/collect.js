// netlify/functions/collect.js
import crypto from "crypto";

export async function handler(event) {
  // 1) data 파라미터 하나로 읽어오기 (URL-encoded JSON)
  const raw = event.queryStringParameters.data;
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
  const effectiveClientId = payload.client_id || crypto.randomUUID();
  payload.client_id = effectiveClientId;

  // 4) session_id가 비어 있으면 생성 (세션 식별)
  if (!payload.session_id) {
    payload.session_id = crypto.randomUUID();
  }

  // 5) GA4 Measurement Protocol collect 엔드포인트 (한 줄)
  const url =
    "https://www.google-analytics.com/mp/collect" +
    "?measurement_id=G-LKLBT4Z5XG" +
    "&api_secret=6wzs8wmxRtKdQznxUvY4Fg";

  // 6) POST 요청으로 payload 전송
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // 7) Netlify 함수는 상태 코드 그대로 반환
  return { statusCode: resp.status };
}


/*
  --------------------------
  프론트엔드 예시
  --------------------------
*/

// 1) 페이지 진입 시 session_start + page_view + traffic_source
(function sendPageView() {
  const cid = localStorage.getItem("ga_cid") || crypto.randomUUID();
  const sid = localStorage.getItem("ga_sid") || crypto.randomUUID();
  localStorage.setItem("ga_cid", cid);
  localStorage.setItem("ga_sid", sid);

  const payload = {
    client_id: cid,
    session_id: sid,
    events: [
      { name: "session_start" },
      {
        name: "page_view",
        params: {
          page_location: location.href,
          page_title: document.title,
          traffic_source: {
            source: document.referrer || "direct",
            medium: "referral",
            campaign: new URLSearchParams(location.search).get("utm_campaign") || ""
          }
        }
      }
    ]
  };

  const url =
    "https://ubiquitous-seahorse-c90f82.netlify.app/.netlify/functions/collect" +
    `?data=${encodeURIComponent(JSON.stringify(payload))}`;

  // no-cors 옵션으로 이미지처럼 요청
  fetch(url, { mode: "no-cors" });
})();

// 2) 사용자 참여 (체류시간) 예시: 언로드 직전
window.addEventListener("beforeunload", () => {
  const cid = localStorage.getItem("ga_cid");
  const sid = localStorage.getItem("ga_sid");
  const dwell = performance.now(); // 예시

  const payload = {
    client_id: cid,
    session_id: sid,
    events: [
      {
        name: "user_engagement",
        params: { engagement_time_msec: Math.floor(dwell) }
      }
    ]
  };

  navigator.sendBeacon(
    "https://ubiquitous-seahorse-c90f82.netlify.app/.netlify/functions/collect" +
    `?data=${encodeURIComponent(JSON.stringify(payload))}`,
    null
  );
});

// 3) 외부 링크 클릭 예시
document.addEventListener("click", (evt) => {
  if (evt.target.tagName === 'A' && evt.target.hostname !== location.hostname) {
    const cid = localStorage.getItem("ga_cid");
    const sid = localStorage.getItem("ga_sid");

    const payload = {
      client_id: cid,
      session_id: sid,
      events: [
        {
          name: "click",
          params: {
            link_url: evt.target.href,
            click_type: "outbound"
          }
        }
      ]
    };

    navigator.sendBeacon(
      "https://ubiquitous-seahorse-c90f82.netlify.app/.netlify/functions/collect" +
      `?data=${encodeURIComponent(JSON.stringify(payload))}`
    );
  }
});
