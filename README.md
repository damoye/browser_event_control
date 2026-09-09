# Event Controller

一键屏蔽页面的 `blur` / `visibilitychange` 等事件监听器，屏蔽列表可在弹窗里配置。适用于 Chrome / Edge 等 Chromium 内核浏览器（需 Chrome 111+，用了 MV3 的 `world: "MAIN"` 内容脚本）。

## 安装

1. 打开 `chrome://extensions`
2. 右上角开启「开发者模式」
3. 点「加载已解压的扩展程序」，选择本目录

## 使用

- 点浏览器工具栏的插件图标 → **总开关** 即为一键开/关
- 列表里是当前被屏蔽的事件名，✕ 移除，下方输入框添加（带常用事件补全）
- 改动即时生效，无需刷新

## 自检

起个静态服务器（`python3 -m http.server 8899`）后打开 `http://127.0.0.1:8899/test.html`。合成事件与真实事件走同一条传播路径，所以页面能直接自测。默认配置下应显示：

```text
已拦截: visibilitychange, window blur | 已放行: pagehide, 元素 blur ✓ 插件生效
```

console 里有两条 `console.assert`：默认事件必须被拦、元素级 blur 必须放行。改动配置不用刷新页面即可在 popup 里反复验证。

## 原理与边界

`block.js` 以 MAIN world 在 `document_start` 注入，比页面任何脚本都早，在 `window` 上注册**捕获阶段**监听器；事件真的发生时才查配置，命中就 `stopImmediatePropagation()`，页面后注册的监听器（含 `onblur = fn`、内联属性）都收不到。因为决策在派发时而非注册时，配置从 `chrome.storage` 异步到达不会漏掉早期监听器。

已知边界：

- 只拦 `target` 为 `window` / `document` 的事件，元素上的 `blur`/`focus` 照常派发，避免破坏表单校验。
- 自定义新增的事件名在配置到达时才挂钩；若页面在更早的时机就注册了同名监听器，需刷新页面才可靠（预置事件不受影响）。
- 不伪造 `document.hidden` / `visibilityState` 的值。若目标站点是轮询这两个属性而不是监听事件，本插件管不到——需要时再在 `block.js` 里加属性覆写。
- 配置存 `chrome.storage.sync`，随账号同步。

## 文件

| 文件 | 作用 |
| --- | --- |
| `manifest.json` | MV3 清单，两个 `document_start` 内容脚本 |
| `block.js` | MAIN world，实际拦截逻辑 |
| `bridge.js` | ISOLATED world，把 storage 配置推给 MAIN |
| `popup.html` / `popup.js` | 配置界面 |
| `test.html` | 自检页 |
