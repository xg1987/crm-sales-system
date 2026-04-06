type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>() => Promise<T | null>;
  run: () => Promise<unknown>;
  all: <T = unknown>() => Promise<{ results?: T[] }>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

export interface Env {
  DB: D1Database;
}

type UserRow = {
  id: string;
  phone: string;
  password_hash: string;
  name: string;
  position: string;
  signature: string;
  avatar: string;
  email: string;
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200';

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type, authorization',
      'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
      ...(init.headers || {}),
    },
  });
}

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function createId() {
  return crypto.randomUUID();
}

async function parseBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function getUserFromRequest(request: Request, env: Env) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;

  const tokenHash = await sha256(token);
  const session = await env.DB.prepare(
    `SELECT s.user_id, u.id, u.phone, u.name, u.position, u.signature, u.avatar, u.email
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now')`
  ).bind(tokenHash).first<UserRow & { user_id: string }>();

  if (!session) return null;

  return {
    id: session.id,
    phone: session.phone,
    name: session.name,
    position: session.position,
    signature: session.signature,
    avatar: session.avatar,
    email: session.email,
  };
}

async function createSession(userId: string, env: Env) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await sha256(token);
  const sessionId = createId();
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, datetime('now', '+30 day'), datetime('now'))`
  ).bind(sessionId, userId, tokenHash).run();
  return token;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return json({ ok: true });
    }

    if (url.pathname === '/api/auth/register' && request.method === 'POST') {
      const body = await parseBody(request);
      const { phone, password, name } = body as { phone?: string; password?: string; name?: string };

      if (!phone || !password || !name) {
        return json({ error: '缺少必要参数' }, { status: 400 });
      }

      const exists = await env.DB.prepare('SELECT id FROM users WHERE phone = ?').bind(phone).first();
      if (exists) {
        return json({ error: '该手机号已被注册' }, { status: 409 });
      }

      const userId = createId();
      const passwordHash = await sha256(password);
      await env.DB.prepare(
        `INSERT INTO users (id, phone, password_hash, name, position, signature, avatar, email, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        userId,
        phone,
        passwordHash,
        name,
        '销售顾问',
        '以诚待人，以礼从商。传递华夏智慧，服务雅士人生。',
        DEFAULT_AVATAR,
        ''
      ).run();

      const token = await createSession(userId, env);
      return json({
        success: true,
        token,
        user: {
          id: userId,
          phone,
          name,
          position: '销售顾问',
          signature: '以诚待人，以礼从商。传递华夏智慧，服务雅士人生。',
          avatar: DEFAULT_AVATAR,
          email: '',
        },
      });
    }

    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      const body = await parseBody(request);
      const { phone, password } = body as { phone?: string; password?: string };
      if (!phone || !password) {
        return json({ error: '请输入账号和密码' }, { status: 400 });
      }

      const user = await env.DB.prepare('SELECT * FROM users WHERE phone = ?').bind(phone).first<UserRow>();
      if (!user) {
        return json({ error: '账号或密码错误' }, { status: 401 });
      }

      const passwordHash = await sha256(password);
      if (passwordHash !== user.password_hash) {
        return json({ error: '账号或密码错误' }, { status: 401 });
      }

      const token = await createSession(user.id, env);
      return json({
        success: true,
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          position: user.position,
          signature: user.signature,
          avatar: user.avatar,
          email: user.email,
        },
      });
    }

    if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
      const auth = request.headers.get('authorization') || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (token) {
        const tokenHash = await sha256(token);
        await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
      }
      return json({ success: true });
    }

    const user = await getUserFromRequest(request, env);
    if (!user) {
      return json({ error: '未登录或登录已失效' }, { status: 401 });
    }

    if (url.pathname === '/api/me' && request.method === 'GET') {
      return json({ user });
    }

    if (url.pathname === '/api/me' && request.method === 'PUT') {
      const body = await parseBody(request);
      const next = {
        name: body.name ?? user.name,
        position: body.position ?? user.position,
        signature: body.signature ?? user.signature,
        avatar: body.avatar ?? user.avatar,
        phone: body.phone ?? user.phone,
        email: body.email ?? user.email,
      };

      await env.DB.prepare(
        `UPDATE users
         SET name = ?, position = ?, signature = ?, avatar = ?, phone = ?, email = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).bind(next.name, next.position, next.signature, next.avatar, next.phone, next.email, user.id).run();

      return json({ success: true, user: { ...user, ...next } });
    }

    if (url.pathname === '/api/customers' && request.method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT * FROM customers WHERE user_id = ? ORDER BY updated_at DESC, created_at DESC`
      ).bind(user.id).all();

      const customers = (rows.results || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        wechatId: row.wechat_id || '',
        city: row.city || '',
        birthInfo: row.birth_date ? { date: row.birth_date, time: row.birth_time || '', type: row.birth_type || 'solar' } : undefined,
        avatar: row.avatar || DEFAULT_AVATAR,
        ziWeiChart: row.ziwei_chart || '',
        fengShuiImages: row.fengshui_images_json ? JSON.parse(row.fengshui_images_json) : [],
        status: row.status,
        level: row.level,
        nextFollowUpDate: row.next_follow_up_date || undefined,
        followUpRecords: row.follow_up_records_json ? JSON.parse(row.follow_up_records_json) : [],
        familyMembers: row.family_members_json ? JSON.parse(row.family_members_json) : [],
        archived: !!row.archived,
      }));

      return json({ customers });
    }

    if (url.pathname === '/api/customers' && request.method === 'POST') {
      const body = await parseBody(request);
      const id = createId();
      await env.DB.prepare(
        `INSERT INTO customers (
          id, user_id, name, phone, wechat_id, city, birth_date, birth_time, birth_type,
          avatar, ziwei_chart, fengshui_images_json, status, level, next_follow_up_date,
          follow_up_records_json, family_members_json, archived, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        id,
        user.id,
        body.name || '',
        body.phone || '',
        body.wechatId || '',
        body.city || '',
        body.birthInfo?.date || null,
        body.birthInfo?.time || null,
        body.birthInfo?.type || null,
        body.avatar || DEFAULT_AVATAR,
        body.ziWeiChart || '',
        JSON.stringify(body.fengShuiImages || []),
        body.status || 'to-follow',
        body.level || '新流量',
        body.nextFollowUpDate || null,
        JSON.stringify(body.followUpRecords || []),
        JSON.stringify(body.familyMembers || []),
        body.archived ? 1 : 0
      ).run();

      return json({
        success: true,
        customer: {
          id,
          name: body.name || '',
          phone: body.phone || '',
          wechatId: body.wechatId || '',
          city: body.city || '',
          birthInfo: body.birthInfo,
          avatar: body.avatar || DEFAULT_AVATAR,
          ziWeiChart: body.ziWeiChart || '',
          fengShuiImages: body.fengShuiImages || [],
          status: body.status || 'to-follow',
          level: body.level || '新流量',
          nextFollowUpDate: body.nextFollowUpDate,
          followUpRecords: body.followUpRecords || [],
          familyMembers: body.familyMembers || [],
          archived: !!body.archived,
        },
      });
    }

    const customerMatch = url.pathname.match(/^\/api\/customers\/([^/]+)$/);
    if (customerMatch && request.method === 'PUT') {
      const id = customerMatch[1];
      const body = await parseBody(request);

      const existing = await env.DB.prepare('SELECT * FROM customers WHERE id = ? AND user_id = ?').bind(id, user.id).first<any>();
      if (!existing) {
        return json({ error: '客户不存在' }, { status: 404 });
      }

      const merged = {
        name: body.name ?? existing.name,
        phone: body.phone ?? existing.phone,
        wechatId: body.wechatId ?? existing.wechat_id,
        city: body.city ?? existing.city,
        birthInfo: body.birthInfo ?? (existing.birth_date ? { date: existing.birth_date, time: existing.birth_time || '', type: existing.birth_type || 'solar' } : undefined),
        avatar: body.avatar ?? existing.avatar,
        ziWeiChart: body.ziWeiChart ?? existing.ziwei_chart,
        fengShuiImages: body.fengShuiImages ?? (existing.fengshui_images_json ? JSON.parse(existing.fengshui_images_json) : []),
        status: body.status ?? existing.status,
        level: body.level ?? existing.level,
        nextFollowUpDate: body.nextFollowUpDate ?? existing.next_follow_up_date,
        followUpRecords: body.followUpRecords ?? (existing.follow_up_records_json ? JSON.parse(existing.follow_up_records_json) : []),
        familyMembers: body.familyMembers ?? (existing.family_members_json ? JSON.parse(existing.family_members_json) : []),
        archived: body.archived ?? !!existing.archived,
      };

      await env.DB.prepare(
        `UPDATE customers SET
          name = ?, phone = ?, wechat_id = ?, city = ?, birth_date = ?, birth_time = ?, birth_type = ?,
          avatar = ?, ziwei_chart = ?, fengshui_images_json = ?, status = ?, level = ?, next_follow_up_date = ?,
          follow_up_records_json = ?, family_members_json = ?, archived = ?, updated_at = datetime('now')
         WHERE id = ? AND user_id = ?`
      ).bind(
        merged.name,
        merged.phone,
        merged.wechatId,
        merged.city,
        merged.birthInfo?.date || null,
        merged.birthInfo?.time || null,
        merged.birthInfo?.type || null,
        merged.avatar,
        merged.ziWeiChart,
        JSON.stringify(merged.fengShuiImages || []),
        merged.status,
        merged.level,
        merged.nextFollowUpDate || null,
        JSON.stringify(merged.followUpRecords || []),
        JSON.stringify(merged.familyMembers || []),
        merged.archived ? 1 : 0,
        id,
        user.id
      ).run();

      return json({ success: true, customer: { id, ...merged } });
    }

    if (customerMatch && request.method === 'DELETE') {
      const id = customerMatch[1];
      await env.DB.prepare('DELETE FROM customers WHERE id = ? AND user_id = ?').bind(id, user.id).run();
      return json({ success: true });
    }

    return json({ error: 'Not found' }, { status: 404 });
  },
};
