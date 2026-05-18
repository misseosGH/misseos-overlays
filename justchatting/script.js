const YOUTUBE_CHANNEL_ID = "UCP_lwTyk1xTPkprlGL_0xGw";

async function loadLatestYouTube() {

  const feedUrl =
    `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

  const rssToJsonUrl =
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

  try {

    const res = await fetch(rssToJsonUrl);

    const data = await res.json();

    const item = data.items.find(video => {
      return !video.link.includes("/shorts/");
    });

    document.getElementById("youtubeTitle").textContent =
      item.title;

    document.getElementById("youtubeThumb").src =
      item.thumbnail;

  } catch (err) {

    console.log("YouTube load failed", err);

  }
}

loadLatestYouTube();

setInterval(loadLatestYouTube, 300000);