import { analyzeText, analyzeImage } from './api/huggingface.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "truthlens-explain",
    title: "Explain with TruthLens",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "truthlens-summarize",
    title: "Summarize with TruthLens",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) return;

  const type = info.menuItemId === "truthlens-explain" ? "explain" : "summarize";
  const text = info.selectionText;

  // Let content script know we are loading
  chrome.tabs.sendMessage(tab.id, { type: "TRUTHLENS_LOADING" }).catch(() => {});

  try {
    const result = await analyzeText(text, type);
    
    // Send result to content script to display
    chrome.tabs.sendMessage(tab.id, {
      type: "TRUTHLENS_RESULT",
      payload: { result, type }
    }).catch(() => {});
    
  } catch (error) {
    chrome.tabs.sendMessage(tab.id, {
      type: "TRUTHLENS_ERROR",
      payload: error.message
    }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ANALYZE_PAGE") {
    // We do the HF analysis here to avoid CORS from content.js
    (async () => {
      let textRes = null;
      let imgRes = null;
      
      try {
        if (msg.payload.text) {
          textRes = await analyzeText(msg.payload.text, "fake_news");
        }
      } catch (e) { textRes = { error: e.message }; }

      try {
        if (msg.payload.imageUrl) {
          imgRes = await analyzeImage(msg.payload.imageUrl);
        }
      } catch (e) { imgRes = { error: e.message }; }

      sendResponse({ textAnalysis: textRes, imageAnalysis: imgRes });
    })();
    return true; // async response
  }
});