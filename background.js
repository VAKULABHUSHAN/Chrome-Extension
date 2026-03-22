import { analyzeText } from './api/huggingface.js';

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
    const storage = await chrome.storage.local.get("hfApiKey");
    if (!storage.hfApiKey) {
      throw new Error("Please enter your Hugging Face API Key in the TruthLens popup.");
    }

    const result = await analyzeText(text, type, storage.hfApiKey);
    
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