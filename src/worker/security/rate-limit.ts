import { createMiddleware } from 'hono/factory';
import { ApiError } from '../http';
import type { AppEnv } from '../types';

type LimiterName = 'RL_CREATE' | 'RL_WRITE' | 'RL_READ';

function pickLimiter(method: string, path: string): LimiterName {
  if (method === 'POST' && path === '/api/groups') return 'RL_CREATE';
  return method === 'GET' || method === 'HEAD' ? 'RL_READ' : 'RL_WRITE';
}

/**
 * Limitación de peticiones por IP (ADR-0012). `CF-Connecting-IP` lo fija Cloudflare
 * y el cliente no puede falsearlo en producción.
 */
export const rateLimit = createMiddleware<AppEnv>(async (c, next) => {
  const name = pickLimiter(c.req.method, c.req.path);
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
  const { success } = await c.env[name].limit({ key: `${name}:${ip}` });
  if (!success) throw new ApiError('RATE_LIMITED');
  await next();
});
