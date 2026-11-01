// Shared high scores for Birdy's Zoomies. Stores three-letter initials, score, balls and time only.
const ORIGINS = new Set(['https://iambirdy.com', 'https://www.iambirdy.com']);
const KEEP = 200;
const TOP = 10;
// Three-letter combinations that are not allowed on a family-friendly board.
const BLOCKED = new Set(['ASS', 'FUK', 'FUC', 'FCK', 'FKU', 'SHT', 'SHI', 'CUM', 'DIK', 'DIC', 'COK', 'KKK', 'NIG', 'NGR', 'NGA',
  'FAG', 'TIT', 'SEX', 'XXX', 'JIZ', 'WTF', 'KYS', 'HOE', 'PUS', 'VAG', 'NAZ']);

const cors = origin => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
});
const reply = (body, status, origin) => new Response(JSON.stringify(body), {
  status,
  headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', ...(origin ? cors(origin) : {})}
});
const top = async db => (await db.prepare('SELECT initials, score, balls FROM scores ORDER BY score DESC, id ASC LIMIT ?').bind(TOP).all()).results;

// A run earns at most about 0.36 points per frame from distance; items add bounded bursts.
const plausible = ({score, balls, frames}) => Number.isInteger(score) && Number.isInteger(balls) && Number.isInteger(frames)
  && score > 0 && score <= 2000000 && balls >= 0 && balls <= frames / 6 && frames >= 60 && frames <= 60 * 60 * 90
  && score <= frames * 7 + 500;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    // DEV_ORIGIN is set only in a local, untracked .dev.vars file for testing.
    const allowed = origin && (ORIGINS.has(origin) || origin === env.DEV_ORIGIN) ? origin : null;
    if (url.pathname !== '/scores') return reply({error: 'not found'}, 404, allowed);
    if (request.method === 'OPTIONS') return new Response(null, {status: allowed ? 204 : 403, headers: allowed ? cors(allowed) : {}});
    if (request.method === 'GET') return reply({scores: await top(env.DB)}, 200, allowed);
    if (request.method !== 'POST') return reply({error: 'method not allowed'}, 405, allowed);
    if (!allowed) return reply({error: 'forbidden'}, 403, null);
    const {success} = await env.LIMITER.limit({key: request.headers.get('CF-Connecting-IP') || 'unknown'});
    if (!success) return reply({error: 'slow down'}, 429, allowed);
    if (Number(request.headers.get('Content-Length') || 0) > 512) return reply({error: 'too large'}, 413, allowed);
    let entry;
    try { entry = await request.json(); } catch { return reply({error: 'bad json'}, 400, allowed); }
    const initials = String(entry.initials || '').toUpperCase();
    if (!/^[A-Z]{3}$/.test(initials)) return reply({error: 'initials must be three letters'}, 400, allowed);
    if (BLOCKED.has(initials)) return reply({error: 'pick different initials'}, 400, allowed);
    if (!plausible(entry)) return reply({error: 'score rejected'}, 400, allowed);
    const {meta} = await env.DB.prepare('INSERT INTO scores (initials, score, balls) VALUES (?, ?, ?)').bind(initials, entry.score, entry.balls).run();
    await env.DB.prepare('DELETE FROM scores WHERE id NOT IN (SELECT id FROM scores ORDER BY score DESC, id ASC LIMIT ?)').bind(KEEP).run();
    const rank = (await env.DB.prepare('SELECT COUNT(*) AS ahead FROM scores WHERE score > ? OR (score = ? AND id < ?)')
      .bind(entry.score, entry.score, meta.last_row_id).first()).ahead + 1;
    return reply({scores: await top(env.DB), rank}, 201, allowed);
  }
};
