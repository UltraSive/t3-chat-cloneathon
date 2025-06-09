import { drizzle } from 'drizzle-orm/postgres-js';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';

export const db = drizzle(DATABASE_URL, { schema });

export default db;