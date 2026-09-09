const DEFAULTS = { enabled: true, events: ["blur", "visibilitychange"] };
const $ = (id) => document.getElementById(id);
let cfg;

async function load() {
  cfg = await chrome.storage.sync.get(DEFAULTS);
  $("enabled").checked = cfg.enabled;
  $("list").replaceChildren(
    ...cfg.events.map((name) => {
      const li = document.createElement("li");
      const code = document.createElement("code");
      code.textContent = name;
      const btn = document.createElement("button");
      btn.textContent = "✕";
      btn.title = "移除";
      btn.onclick = () => {
        cfg.events = cfg.events.filter((n) => n !== name);
        save();
      };
      li.append(code, btn);
      return li;
    }),
  );
}

function save() {
  chrome.storage.sync.set(cfg).then(load);
}

$("enabled").onchange = (e) => {
  cfg.enabled = e.target.checked;
  save();
};
$("add").onclick = () => {
  const name = $("name").value.trim();
  if (!name || cfg.events.includes(name)) return;
  cfg.events.push(name);
  $("name").value = "";
  save();
};
$("name").onkeydown = (e) => {
  if (e.key === "Enter") $("add").click();
};

load();
