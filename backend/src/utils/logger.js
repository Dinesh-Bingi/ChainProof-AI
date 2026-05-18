const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const current = levels[process.env.LOG_LEVEL] ?? levels.info;

function log(level, message, meta) {
  if (levels[level] > current) return;
  const ts = new Date().toISOString();
  const payload = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
  console[level === "debug" ? "log" : level](`[${ts}] ${level.toUpperCase()}: ${message}${payload}`);
}

export const logger = {
  error: (msg, meta) => log("error", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  info: (msg, meta) => log("info", msg, meta),
  debug: (msg, meta) => log("debug", msg, meta),
};
