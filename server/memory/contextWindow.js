const sessions = new Map();
const MAX_MESSAGES = 12;

export function addToContext(sessionId, role, content) {
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  const history = sessions.get(sessionId);
  history.push({ role, content });
  if (history.length > MAX_MESSAGES) history.shift();
  return history;
}

export function getContext(sessionId) {
  return sessions.get(sessionId) || [];
}
