async function analyzeContent({ text, images, videos, url }) {
  const textScore = analyzeText(text);
  const mediaScore = analyzeMedia(images, videos);
  const sourceScore = analyzeSource(url);

  const finalScore = Math.round((textScore + mediaScore + sourceScore) / 3);

  return {
    score: finalScore,
    details: {
      textScore,
      mediaScore,
      sourceScore
    }
  };
}

function analyzeText(text) {
  const fakeKeywords = ["shocking", "you won't believe", "fake", "hoax"];
  let penalty = 0;

  fakeKeywords.forEach(k => {
    if (text.toLowerCase().includes(k)) penalty += 10;
  });

  return Math.max(100 - penalty, 10);
}

function analyzeMedia(images, videos) {
  if (images.length + videos.length > 10) return 50;
  return 80;
}

function analyzeSource(url) {
  if (url.includes(".gov") || url.includes(".edu")) return 90;
  if (url.includes("blog") || url.includes("unknown")) return 40;
  return 70;
}

