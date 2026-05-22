const TWITCH_CHANNEL = "misseos";
const YOUTUBE_CHANNEL_ID = "UCP_lwTyk1xTPkprlGL_0xGw";

let hasLoadedYouTube = false;

async function loadGame() {
  try {
    const response = await fetch(
      `https://decapi.me/twitch/game/${TWITCH_CHANNEL}?t=${Date.now()}`,
      { cache: "no-store" }
    );

    const game = await response.text();

    const gameTitle = document.getElementById("gameTitle");

    if (gameTitle) {
      gameTitle.textContent = game || "Loading game...";
    }

  } catch (err) {
    console.log("Game load failed", err);
  }
}

async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;

  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function getLatestFromRss2Json(feedUrl) {
  const rssToJsonUrl =
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&t=${Date.now()}`;

  const res = await fetchWithTimeout(rssToJsonUrl, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`rss2json failed: ${res.status}`);
  }

  const data = await res.json();

  console.log("rss2json response:", data);

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("rss2json returned no items");
  }

  const item = data.items.find(video => {
    return video.link && !video.link.includes("/shorts/");
  });

  if (!item) {
    throw new Error("rss2json found no usable video");
  }

  return {
    title: item.title,
    thumbnail: item.thumbnail,
    link: item.link
  };
}

async function getLatestFromYouTubeRss(feedUrl) {
  const proxyUrl =
    `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}&t=${Date.now()}`;

  const res = await fetchWithTimeout(proxyUrl, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`YouTube RSS proxy failed: ${res.status}`);
  }

  const xmlText = await res.text();

  console.log("YouTube RSS response:", xmlText.slice(0, 500));

  const entryMatches = xmlText.match(/<entry>[\s\S]*?<\/entry>/g);

  if (!entryMatches || entryMatches.length === 0) {
    throw new Error("No entries found in YouTube RSS");
  }

  for (const entry of entryMatches) {
    const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
    const videoIdMatch = entry.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/);
    const linkMatch = entry.match(/href="([^"]+)"/);

    const title = titleMatch ? titleMatch[1].trim() : "";
    const videoId = videoIdMatch ? videoIdMatch[1].trim() : "";
    const link = linkMatch ? linkMatch[1].trim() : "";

    if (title && videoId && link && !link.includes("/shorts/")) {
      return {
        title: title,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        link: link
      };
    }
  }

  throw new Error("No usable video found in YouTube RSS");
}

async function loadLatestYouTube() {
  const titleEl = document.getElementById("youtubeTitle");
  const thumbEl = document.getElementById("youtubeThumb");

  if (!titleEl || !thumbEl) {
    console.log("YouTube elements missing from HTML");
    return;
  }

  const feedUrl =
    `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

  try {
    let video = null;

    try {
      video = await getLatestFromRss2Json(feedUrl);
    } catch (rss2jsonErr) {
      console.log("rss2json method failed, trying direct RSS method:", rss2jsonErr);
      video = await getLatestFromYouTubeRss(feedUrl);
    }

    if (!video || !video.title || !video.thumbnail) {
      throw new Error("Video data missing title or thumbnail");
    }

    titleEl.textContent = video.title;

    thumbEl.src = video.thumbnail;
    thumbEl.alt = video.title;
    thumbEl.style.display = "block";

    hasLoadedYouTube = true;

  } catch (err) {
    console.log("YouTube load failed completely:", err);

    if (hasLoadedYouTube) {
      return;
    }

    titleEl.textContent = "Latest upload unavailable";

    thumbEl.removeAttribute("src");
    thumbEl.style.display = "none";
  }
}

loadGame();
loadLatestYouTube();

setInterval(loadGame, 15000);
setInterval(loadLatestYouTube, 300000);