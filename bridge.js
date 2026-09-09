// ISOLATED world：唯一能访问 chrome.storage 的一侧，把配置推给 MAIN world。
const DEFAULTS = { enabled: true, events: ["blur", "visibilitychange"] };

async function push() {
  const cfg = await chrome.storage.sync.get(DEFAULTS);
  document.dispatchEvent(
    new CustomEvent("__bec_config", { detail: JSON.stringify(cfg) }),
  );
}

push();
chrome.storage.onChanged.addListener((_, area) => {
  if (area === "sync") push();
});
