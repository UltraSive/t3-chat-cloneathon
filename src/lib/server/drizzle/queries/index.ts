import { db } from '$lib/server/drizzle';
import { sessions, models } from '$lib/server/drizzle/schema';
import type { User, Session, NewSession, Model } from '$lib/server/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function getModelById(id: string) {
  try {
    const model = await db
      .select()
      .from(models) // Your models table
      .where(eq(models.id, id)) // Using Drizzle's query builder
      .execute(); // Execute the query

    if (model.length === 0) {
      throw new Error(`Model with ID ${id} not found`);
    }

    return model[0]; // Return the first matching record
  } catch (error) {
    console.error('Error fetching model:', error);
    throw error; // Re-throw the error after logging it
  }
}