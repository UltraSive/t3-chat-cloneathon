import type { PageServerLoad } from './$types';
import { catchError } from "$lib/handle";
import convexClient from "$lib/server/convex"
import { api } from '$convex/_generated/api.js';

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = locals;


};