importScripts("utils/analyzer.js", "api/mockApi.js");

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "ANALYZE_CONTENT") {
    const result = await analyzeContent(msg.payload);

    chrome.storage.local.set({ lastResult: result });

    sendResponse(result);
  }
  return true;
});