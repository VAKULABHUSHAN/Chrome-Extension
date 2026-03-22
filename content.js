chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "TRUTHLENS_LOADING") {
    showModal("AI is thinking...", true);
  } else if (msg.type === "TRUTHLENS_RESULT") {
    showModal(msg.payload.result, false, msg.payload.type);
  } else if (msg.type === "TRUTHLENS_ERROR") {
    showModal(`Error: ${msg.payload}`, false, "error");
  }
});

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
      zIndex: "2147483647", // Max z-index
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
    closeBtn.onclick = () => modal.remove();
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
    
    // Add keyframes if not exists
    if (!document.getElementById("truthlens-styles")) {
      const style = document.createElement("style");
      style.id = "truthlens-styles";
      style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
  } else {
    titleDiv.innerText = type === "error" ? "TruthLens Error" : `TruthLens: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    if (type === "error") {
      titleDiv.style.color = "#ef4444";
    } else {
      titleDiv.style.color = "#4f46e5";
    }
    contentDiv.innerText = content;
  }
}