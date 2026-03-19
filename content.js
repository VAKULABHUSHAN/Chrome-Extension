(async function () {
  const text = document.body.innerText;

  const images = [...document.images].map(img => img.src);
  const videos = [...document.querySelectorAll('video')].map(v => v.src);

  const response = await chrome.runtime.sendMessage({
    type: "ANALYZE_CONTENT",
    payload: { text, images, videos, url: location.href }
  });

  injectBadge(response);
})();

function injectBadge(data) {
  const badge = document.createElement("div");
  badge.id = "truthlens-badge";

  let color = "green";
  if (data.score < 40) color = "red";
  else if (data.score < 70) color = "yellow";

  badge.innerText = `TruthLens: ${data.score}`;

  badge.style.position = "fixed";
  badge.style.bottom = "20px";
  badge.style.right = "20px";
  badge.style.padding = "10px 15px";
  badge.style.borderRadius = "10px";
  badge.style.zIndex = "9999";
  badge.style.color = "white";
  badge.style.fontWeight = "bold";
  badge.style.backgroundColor = color;

  document.body.appendChild(badge);
}