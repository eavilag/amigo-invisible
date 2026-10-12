import { Hono } from 'hono';
import { ApiError } from './http';
import { adminRoutes } from './routes/admin';
import { participantRoutes } from './routes/participant';
import { publicRoutes } from './routes/public';
import { rateLimit } from './security/rate-limit';
import type { AppEnv } from './types';

/** Composición de la API (ARQ §5). */
export const app = new Hono<AppEnv>().basePath('/api');

app.use('*', rateLimit);

app.get('/health', (c) => c.json({ ok: true }));
app.route('/', publicRoutes);
app.route('/', participantRoutes);
app.route('/', adminRoutes);

app.notFound((c) => c.json(new ApiError('NOT_FOUND').toBody(), 404));

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(err.toBody(), err.status as 400);
  }
  // Registro sin datos personales ni secretos (RNF-13, AME-16).
  console.error(JSON.stringify({ level: 'error', method: c.req.method, route: c.req.routePath, error: err.name, message: err.message }));
  return c.json(new ApiError('INTERNAL').toBody(), 500);
});
