import { applyD1Migrations } from 'cloudflare:test';
import { env } from 'cloudflare:workers';

// Aplica las migraciones reales de /migrations a la D1 local de cada prueba.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
