import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/drizzle';
import { models } from '$lib/server/drizzle/schema';

export const load: LayoutServerLoad = async () => {
  return {
    models: await db
      .select()
      .from(models)
      .orderBy(models.name)
  }
};