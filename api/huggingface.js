export async function analyzeText(text, type, apiKey) {
  if (!apiKey) {
    throw new Error('Please enter a valid Hugging Face API Key in the settings.');
  }

  let model = "";
  let payload = { inputs: text };

  if (type === 'summarize') {
    model = "facebook/bart-large-cnn";
  } else if (type === 'sentiment') {
    model = "distilbert-base-uncased-finetuned-sst-2-english";
  } else if (type === 'explain') {
    // For ELI5 or simpler explanation, we can use a text generation model or instruct model
    // Using a quantized fast model or instruction model for explanation
    model = "google/flan-t5-large";
    payload = { inputs: `Explain this like I am 5 years old: ${text}` };
  } else {
    throw new Error('Unknown analysis type');
  }

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Handle cold start 503 errors gracefully
    if (response.status === 503) {
      throw new Error(`Model is loading. Please wait 10-20 seconds and try again.`);
    }
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return processResult(result, type);
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
    }
  }
  return JSON.stringify(apiResult);
}
