document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("status");

  const data = await chrome.storage.local.get("lastResult");

  if (data.lastResult) {
    status.innerText = `Score: ${data.lastResult.score}`;
  } else {
    status.innerText = "No data";
  }

  const toggleBtn = document.getElementById("toggle");

  toggleBtn.onclick = async () => {
    const res = await chrome.storage.local.get("enabled");
    const enabled = !res.enabled;

    await chrome.storage.local.set({ enabled });

    toggleBtn.innerText = enabled ? "ON" : "OFF";
  };
});