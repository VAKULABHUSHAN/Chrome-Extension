import { analyzeText } from './api/huggingface.js';

document.addEventListener("DOMContentLoaded", async () => {
  const apiKeyInput = document.getElementById("api-key");
  const saveKeyBtn = document.getElementById("save-key");
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

  // Load saved API key
  const storage = await chrome.storage.local.get("hfApiKey");
  if (storage.hfApiKey) {
    apiKeyInput.value = storage.hfApiKey;
  }

  saveKeyBtn.addEventListener("click", async () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      await chrome.storage.local.set({ hfApiKey: key });
      saveKeyBtn.innerText = "Saved!";
      setTimeout(() => saveKeyBtn.innerText = "Save", 2000);
    }
  });

  async function handleAnalysis(type) {
    const text = textInput.value.trim();
    if (!text) {
      showError("Please enter some text to analyze.");
      return;
    }

    const key = apiKeyInput.value.trim();
    if (!key) {
      showError("Please enter and save your Hugging Face API key.");
      return;
    }

    // UI State
    hideError();
    hideResult();
    showLoading();

    try {
      const result = await analyzeText(text, type, key);
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