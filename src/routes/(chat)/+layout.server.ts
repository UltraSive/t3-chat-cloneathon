import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/drizzle';
import { models, modelsTools, tools } from '$lib/server/drizzle/schema';
import type { Tool } from '$lib/server/drizzle/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async () => {
  const allModelsWithTools = await db.query.models.findMany({
    with: {
      tools: {
        with: {
          tool: true, // Include the `tool` from the junction
        },
      },
    },
  });

  return {
    models: allModelsWithTools,
  };
};