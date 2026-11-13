// Points the download buttons at the newest release's files (from GitHub), and the
// main button at the right one for this computer. Without this (or if GitHub can't
// be reached), every button opens the release page instead.
(async () => {
  const repo = document.documentElement.dataset.releases || "NoobbyTV/poro-tracker-releases";
  const agent = navigator.userAgent;
  const os = /Windows/.test(agent) ? "windows" : /Linux|X11/.test(agent) && !/Android/.test(agent) ? "linux" : "other";
  const browser = /Firefox\//.test(agent) ? "firefox" : "chrome";

  const hero = document.getElementById("hero-download");
  const label = { windows: "Download for Windows", linux: "Download for Linux", other: "Get the browser extension" };
  if (hero) hero.textContent = label[os];
  document.querySelector(`.dl[data-os="${os === "other" ? browser : os}"]`)?.classList.add("yours");

  let release;
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { accept: "application/vnd.github+json" } });
    if (!response.ok) return;
    release = await response.json();
  } catch {
    return;
  }
  const files = {
    windows: /Setup-.*\.exe$/,
    appimage: /\.AppImage$/,
    targz: /x64\.tar\.gz$/,
    chrome: /chrome-.*\.zip$/,
    firefox: /firefox-.*\.zip$/
  };
  const urls = {};
  for (const [key, pattern] of Object.entries(files)) {
    const asset = release.assets?.find((entry) => pattern.test(entry.name));
    if (asset) urls[key] = asset.browser_download_url;
  }
  for (const link of document.querySelectorAll("[data-asset]")) {
    const url = urls[link.dataset.asset];
    if (url) link.href = url;
  }
  if (hero) hero.href = os === "windows" ? urls.windows ?? "#download" : os === "linux" ? urls.appimage ?? "#download" : "#download";

  const version = String(release.tag_name ?? "").replace(/^v/, "");
  const date = release.published_at ? new Date(release.published_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "";
  const line = document.getElementById("version-line");
  if (line && version) line.textContent = `Version ${version} · Windows · Linux · Chrome · Firefox`;
  const downloadLine = document.getElementById("download-version");
  if (downloadLine && version) downloadLine.textContent = `Version ${version}${date ? `, ${date}` : ""}. Free, straight from GitHub.`;
})();
