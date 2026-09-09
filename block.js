// MAIN world：在页面任何脚本之前注册捕获监听器。
// 事件真的发生时再查配置决定是否拦截，所以配置异步到达也不会漏。
(() => {
  // 预置事件在 document_start 就挂钩；用户后加的自定义事件在配置到达时补挂。
  const PRESET = [
    "blur",
    "focus",
    "visibilitychange",
    "pagehide",
    "pageshow",
    "freeze",
    "resume",
  ];
  const hooked = new Set();
  let enabled = true;
  let blocked = new Set(["blur", "visibilitychange"]);

  function hook(type) {
    if (hooked.has(type)) return;
    hooked.add(type);
    window.addEventListener(
      type,
      (e) => {
        if (!enabled || !blocked.has(type)) return;
        // 只拦窗口/文档级事件，放过元素上的 blur/focus（表单 onBlur 仍能正常工作）
        if (e.target !== window && e.target !== document) return;
        e.stopImmediatePropagation();
      },
      true,
    );
  }

  PRESET.forEach(hook);

  document.addEventListener(
    "__bec_config",
    (e) => {
      let cfg;
      try {
        cfg = JSON.parse(e.detail);
      } catch {
        return;
      }
      enabled = cfg.enabled !== false;
      blocked = new Set(cfg.events || []);
      blocked.forEach(hook);
    },
    true,
  );
})();
