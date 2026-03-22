import { analyzeText } from './api/huggingface.js';

document.addEventListener("DOMContentLoaded", async () => {
  const textInput = document.getElementById("text-input");
  
  const btnSummarize = document.getElementById("btn-summarize");
  const btnExplain = document.getElementById("btn-explain");
  const btnSentiment = document.getElementById("btn-sentiment");
  
  const loadingDiv = document.getElementById("loading");
  const resultBox = document.getElementById("result-box");
  const resultText = document.getElementById("result-text");
  const errorBox = document.getElementById("error-box");
  const errorText = document.getElementById("error-text");
  const btnCopy = document.getElementById("btn-copy");

  const liveToggle = document.getElementById("live-toggle");

  // Load existing toggle state
  const state = await chrome.storage.local.get("liveAnalysisEnabled");
  liveToggle.checked = !!state.liveAnalysisEnabled;

  liveToggle.addEventListener("change", async (e) => {
    const enabled = e.target.checked;
    await chrome.storage.local.set({ liveAnalysisEnabled: enabled });
    
    // tell active tab
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_LIVE_ANALYSIS", enabled }).catch(() => console.log("Content script not active"));
    }
  });

  async function handleAnalysis(type) {
    const text = textInput.value.trim();
    if (!text) {
      showError("Please enter some text to analyze.");
      return;
    }

    // UI State
    hideError();
    hideResult();
    showLoading();

    try {
      const result = await analyzeText(text, type);
      showResult(result);
    } catch (err) {
      showError(err.message);
    } finally {
      hideLoading();
    }
  }

  btnSummarize.addEventListener("click", () => handleAnalysis("summarize"));
  btnExplain.addEventListener("click", () => handleAnalysis("explain"));
  btnSentiment.addEventListener("click", () => handleAnalysis("sentiment"));

  btnCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(resultText.innerText).then(() => {
      btnCopy.innerText = "Copied!";
      setTimeout(() => btnCopy.innerText = "Copy", 2000);
    });
  });

  function showLoading() { loadingDiv.classList.remove("hidden"); }
  function hideLoading() { loadingDiv.classList.add("hidden"); }
  
  function showResult(text) {
    resultText.innerText = text;
    resultBox.classList.remove("hidden");
  }
  function hideResult() { resultBox.classList.add("hidden"); }
  
  function showError(msg) {
    errorText.innerText = msg;
    errorBox.classList.remove("hidden");
  }
  function hideError() { errorBox.classList.add("hidden"); }
});