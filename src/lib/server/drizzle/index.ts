import { drizzle } from 'drizzle-orm/postgres-js';
import { DATABASE_URL } from '$env/static/private';

export const db = drizzle(DATABASE_URL);

export default db;