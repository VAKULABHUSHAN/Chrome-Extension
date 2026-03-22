// REPLACE THIS WITH YOUR HUGGING FACE API KEY
const HARDCODED_API_KEY = "hf_YOUR_API_KEY_HERE";

export async function analyzeText(text, type) {
  if (!HARDCODED_API_KEY || HARDCODED_API_KEY === "hf_YOUR_API_KEY_HERE") {
    throw new Error('Please open api/huggingface.js and insert your API Key.');
  }

  let model = "";
  let payload = { inputs: text };

  if (type === 'summarize') {
    model = "facebook/bart-large-cnn";
  } else if (type === 'sentiment') {
    model = "distilbert-base-uncased-finetuned-sst-2-english";
  } else if (type === 'explain') {
    model = "google/flan-t5-large";
    payload = { inputs: `Explain this like I am 5 years old: ${text}` };
  } else if (type === 'fake_news') {
    model = "mrm8488/bert-tiny-finetuned-fake-news-detection";
  } else {
    throw new Error('Unknown analysis type');
  }

  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HARDCODED_API_KEY}`,
      "Content-Type": "application/json",
      "x-use-cache": "false"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 503 || response.status === 504) {
      throw new Error(`Model is loading. Please wait ~15 seconds and try again.`);
    }
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return processResult(result, type);
}

export async function analyzeImage(imageUrl) {
  if (!HARDCODED_API_KEY || HARDCODED_API_KEY === "hf_YOUR_API_KEY_HERE") {
    throw new Error('Please open api/huggingface.js and insert your API Key.');
  }

  const imageRes = await fetch(imageUrl);
  const blob = await imageRes.blob();

  const model = "dima806/deepfake_vs_real_image_detection";
  
  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HARDCODED_API_KEY}`,
      "x-use-cache": "false"
    },
    body: blob
  });

  if (!response.ok) {
    if (response.status === 503 || response.status === 504) {
      throw new Error(`Image Model is loading. Please wait ~15 seconds.`);
    }
    throw new Error(`Image API Error (${response.status})`);
  }

  const result = await response.json();
  return processResult(result, 'fake_image');
}

function processResult(apiResult, type) {
  if (Array.isArray(apiResult) && apiResult.length > 0) {
    if (type === 'summarize') {
      return apiResult[0].summary_text || JSON.stringify(apiResult[0]);
    } else if (type === 'sentiment') {
      const label = apiResult[0][0]?.label || apiResult[0].label || "Unknown";
      const score = Math.round((apiResult[0][0]?.score || apiResult[0].score || 0) * 100) + "%";
      return `${label} (${score})`;
    } else if (type === 'explain') {
      return apiResult[0].generated_text || JSON.stringify(apiResult[0]);
    } else if (type === 'fake_news') {
      let sorted = [...(apiResult[0] || apiResult)].sort((a,b) => b.score - a.score);
      let top = sorted[0];
      let isFake = top.label.includes("1") || top.label.toLowerCase().includes("fake");
      return { type: 'text', label: isFake ? 'Fake Info' : 'Real Info', score: Math.round(top.score * 100) };
    } else if (type === 'fake_image') {
      let sorted = [...apiResult].sort((a,b) => b.score - a.score);
      let top = sorted[0];
      let isFake = top.label.toLowerCase().includes("fake");
      return { type: 'image', label: isFake ? 'Fake Image' : 'Real Image', score: Math.round(top.score * 100) };
    }
  }
  return JSON.stringify(apiResult);
}
