const LATEST_YOUTUBE_URL =
  "https://decapi.me/youtube/latest_video?id=UCP_lwTyk1xTPkprlGL_0xGw&no_shorts=1";

let hasLoadedYouTube = false;

function getYouTubeVideoId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

async function loadLatestYouTube() {
  const titleEl = document.getElementById("youtubeTitle");
  const thumbEl = document.getElementById("youtubeThumb");

  if (!titleEl || !thumbEl) {
    console.log("YouTube elements missing from HTML");
    return;
  }

  try {
    const response = await fetch(`${LATEST_YOUTUBE_URL}&t=${Date.now()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`DecAPI YouTube failed: ${response.status}`);
    }

    const text = await response.text();

    console.log("DecAPI YouTube response:", text);

    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    const videoUrl = urlMatch ? urlMatch[0] : "";

    const videoId = getYouTubeVideoId(videoUrl);

    if (!videoUrl || !videoId) {
      throw new Error("Could not find YouTube URL/video ID in DecAPI response");
    }

    let title = text.replace(videoUrl, "").trim();

    title = title
      .replace(/\s+-\s*$/, "")
      .replace(/\s+\|\s*$/, "")
      .replace(/\s+—\s*$/, "")
      .trim();

    titleEl.textContent = title || "Latest upload";

    thumbEl.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg?t=${Date.now()}`;
    thumbEl.alt = title || "Latest YouTube thumbnail";
    thumbEl.style.display = "block";

    hasLoadedYouTube = true;

  } catch (err) {
    console.log("YouTube load failed:", err);

    if (hasLoadedYouTube) {
      return;
    }

    titleEl.textContent = "Latest upload unavailable";

    thumbEl.removeAttribute("src");
    thumbEl.style.display = "none";
  }
}

loadLatestYouTube();

setInterval(loadLatestYouTube, 300000);