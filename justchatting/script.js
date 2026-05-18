const YOUTUBE_CHANNEL_ID = "UCP_lwTyk1xTPkprlGL_0xGw";

async function loadLatestYouTube() {

  const feedUrl =
    `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

  const rssToJsonUrl =
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

  try {

    const res = await fetch(rssToJsonUrl, {
      cache: "no-store"
    });

    const data = await res.json();

    if (!data.items || !data.items.length) {
      throw new Error("No YouTube items found");
    }

    const item = data.items.find(video => {
      return !video.link.includes("/shorts/");
    });

    if (!item) {
      throw new Error("No non-shorts videos found");
    }

    setText(
      "youtubeTitle",
      item.title || "Latest upload"
    );

    setText(
      "youtubeDesc",
      "Show the YouTube some love 💗"
    );

    setText(
      "youtubeLinkText",
      "!latest"
    );

    setImageWithFallback(
      "youtubeThumb",
      "youtubeFallback",
      item.thumbnail || ""
    );

  } catch (err) {

    console.log(
      "YouTube load failed:",
      err
    );

    setText(
      "youtubeTitle",
      "Latest upload unavailable right now"
    );

    setText(
      "youtubeDesc",
      "Check back soon for the newest upload."
    );

    setText(
      "youtubeLinkText",
      "!latest"
    );
  }
}

function setText(id, value) {

  const el = document.getElementById(id);

  if (el) {
    el.textContent = value;
  }
}

function setImageWithFallback(
  imgId,
  fallbackId,
  src
) {

  const img = document.getElementById(imgId);

  const fallback =
    document.getElementById(fallbackId);

  if (!img || !fallback) {
    return;
  }

  if (!src || !src.trim()) {

    img.style.display = "none";

    fallback.style.display = "grid";

    return;
  }

  img.onload = function () {

    img.style.display = "block";

    fallback.style.display = "none";
  };

  img.onerror = function () {

    img.style.display = "none";

    fallback.style.display = "grid";
  };

  img.src = src;
}

loadLatestYouTube();

setInterval(
  loadLatestYouTube,
  300000
);