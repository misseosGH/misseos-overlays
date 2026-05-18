const TWITCH_CHANNEL = "misseos";
const YOUTUBE_CHANNEL_ID = "UCP_lwTyk1xTPkprlGL_0xGw";

async function loadGame() {
  try {
    const response = await fetch(
      `https://decapi.me/twitch/game/${TWITCH_CHANNEL}`
    );

    const game = await response.text();

    document.getElementById("gameTitle").textContent = game;


  } catch (err) {
    console.log("Game load failed", err);
  }
}

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

loadGame();
loadLatestYouTube();

setInterval(loadGame, 15000);
setInterval(loadLatestYouTube, 300000);