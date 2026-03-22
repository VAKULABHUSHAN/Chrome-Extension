let liveAnalysisEnabled = false;

chrome.storage.local.get("liveAnalysisEnabled", (res) => {
  liveAnalysisEnabled = !!res.liveAnalysisEnabled;
  if(liveAnalysisEnabled) doLiveAnalysis();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "TRUTHLENS_LOADING") {
    showModal("AI is thinking...", true);
  } else if (msg.type === "TRUTHLENS_RESULT") {
    showModal(msg.payload.result, false, msg.payload.type);
  } else if (msg.type === "TRUTHLENS_ERROR") {
    showModal(`Error: ${msg.payload}`, false, "error");
  } else if (msg.type === "TOGGLE_LIVE_ANALYSIS") {
    liveAnalysisEnabled = msg.enabled;
    if (liveAnalysisEnabled) {
      doLiveAnalysis();
    } else {
      let modal = document.getElementById("truthlens-modal");
      if(modal) modal.remove();
    }
  }
});

function doLiveAnalysis() {
  if (!liveAnalysisEnabled) return;

  showModal("Live Analysis: Scanning page for fake info/images...", true);

  // Grab text
  const text = document.body.innerText.substring(0, 1500); 
  // Grab largest image
  const images = Array.from(document.images).filter(img => img.width > 150 && img.height > 150);
  let imageUrl = images.length > 0 ? images[0].src : null;

  chrome.runtime.sendMessage({
    type: "ANALYZE_PAGE",
    payload: { text, imageUrl }
  }, (response) => {
    if(!liveAnalysisEnabled) return;
    
    if(response) {
      let content = "";
      if (response.textAnalysis) {
        if(response.textAnalysis.error) {
          content += `<div style="margin-bottom:8px;"><b>Text:</b> <span style="color:#ef4444">${response.textAnalysis.error}</span></div>`;
        } else {
          let c = response.textAnalysis.label === 'Fake Info' ? '#ef4444' : '#10b981';
          content += `<div style="margin-bottom:8px;"><b>Text:</b> <span style="color:${c}; font-weight:bold;">${response.textAnalysis.label}</span> (${response.textAnalysis.score}% Confidence)</div>`;
        }
      }
      if (response.imageAnalysis) {
        if(response.imageAnalysis.error) {
          content += `<div><b>Image:</b> <span style="color:#ef4444">${response.imageAnalysis.error}</span></div>`;
        } else {
          let c = response.imageAnalysis.label === 'Fake Image' ? '#ef4444' : '#10b981';
          content += `<div><b>Image:</b> <span style="color:${c}; font-weight:bold;">${response.imageAnalysis.label}</span> (${response.imageAnalysis.score}% Confidence)</div>`;
        }
      }
      if (!content) content = "No content analyzed.";
      showModal(content, false, "live");
    }
  });
}

function showModal(content, isLoading = false, type = "") {
  let modal = document.getElementById("truthlens-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "truthlens-modal";
    Object.assign(modal.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      width: "320px",
      backgroundColor: "#ffffff",
      color: "#333333",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      padding: "16px",
      zIndex: "2147483647", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: "14px",
      lineHeight: "1.5"
    });
    
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "✖";
    Object.assign(closeBtn.style, {
      position: "absolute",
      top: "12px",
      right: "12px",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#9ca3af",
      fontSize: "14px",
      padding: "0"
    });
    closeBtn.onmouseover = () => closeBtn.style.color = "#4b5563";
    closeBtn.onmouseout = () => closeBtn.style.color = "#9ca3af";
    closeBtn.onclick = () => {
      modal.remove();
      // If closing the modal manually, disable live analysis to prevent it popping back on navigate
      if(type === 'live') {
        chrome.storage.local.set({ liveAnalysisEnabled: false });
        liveAnalysisEnabled = false;
        // Need to update popup checkbox if we could, but it lives in a different context
      }
    };
    modal.appendChild(closeBtn);

    const titleDiv = document.createElement("div");
    titleDiv.id = "truthlens-modal-title";
    Object.assign(titleDiv.style, {
      fontWeight: "600",
      marginBottom: "12px",
      color: "#4f46e5",
      fontSize: "16px"
    });
    modal.appendChild(titleDiv);

    const contentDiv = document.createElement("div");
    contentDiv.id = "truthlens-modal-content";
    Object.assign(contentDiv.style, {
      maxHeight: "400px",
      overflowY: "auto"
    });
    modal.appendChild(contentDiv);

    document.body.appendChild(modal);
  }

  const titleDiv = document.getElementById("truthlens-modal-title");
  const contentDiv = document.getElementById("truthlens-modal-content");
  
  if (isLoading) {
    titleDiv.innerText = "TruthLens AI";
    contentDiv.innerHTML = `<span style="display:inline-block; animation: spin 1s infinite linear; border: 2px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; width: 12px; height: 12px; margin-right: 8px;"></span><i>${content}</i>`;
    
    if (!document.getElementById("truthlens-styles")) {
      const style = document.createElement("style");
      style.id = "truthlens-styles";
      style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
  } else {
    if (type === "live") {
      titleDiv.innerText = "TruthLens Live Analysis";
      titleDiv.style.color = "#4f46e5";
    } else {
      titleDiv.innerText = type === "error" ? "TruthLens Error" : `TruthLens: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
      titleDiv.style.color = type === "error" ? "#ef4444" : "#4f46e5";
    }
    contentDiv.innerHTML = content;
  }
}