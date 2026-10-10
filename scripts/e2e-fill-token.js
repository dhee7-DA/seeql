(() => {
  const SQL = "WITH stats AS (\n    SELECT\n        user_id,\n        COUNT(*)    AS prompt_count,\n        AVG(tokens) AS avg_raw\n    FROM prompts\n    GROUP BY user_id\n)\nSELECT\n    s.user_id,\n    s.prompt_count,\n    ROUND(s.avg_raw, 2) AS avg_tokens\nFROM stats s\nWHERE s.prompt_count >= 3\n  AND EXISTS (SELECT 1\n              FROM prompts p\n              WHERE p.user_id = s.user_id\n                AND p.tokens > s.avg_raw)\nORDER BY avg_tokens DESC, s.user_id ASC;";
  const tas = [...document.querySelectorAll("textarea")].filter((t) => t.offsetParent);
  if (!tas.length) return "no-textarea";
  const ta = tas[tas.length - 1];
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  setter.call(ta, SQL);
  ta.dispatchEvent(new Event("input", { bubbles: true }));
  return "filled:" + ta.value.length;
})()
