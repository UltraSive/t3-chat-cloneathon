import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw error(401, 'Unauthorized: Please log in to access this page.');
  }

  return { user };
};