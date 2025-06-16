import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/drizzle';
import { users } from '$lib/server/drizzle/schema';
import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { customizeSchema } from '$lib/schemas/customize';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { user } = locals;

  // Define your input
  const input = {
    nickname: user.nickname ? user.nickname : "",
    occupation: user.nickname ? user.occupation : "",
    traits: user.traits ? user.traits : [],
    additionalInfo: user.additionalInfo ? user.additionalInfo : ""
  };

  const form = await superValidate(input, zod(customizeSchema));

  return { form };
};

export const actions = {
  default: async ({ locals, request }) => {
    const { user } = locals;
    console.log("form")

    const form = await superValidate(request, zod(customizeSchema));

    console.log(form.data);
    console.log("Valid: ", form.valid)

    if (!form.valid) return fail(400, { form });

    if (!user) {
      return message(form, "User not authenticated");
    }

    const { nickname, occupation, traits, additionalInfo } = form.data;

    try {
      await db
        .update(users)
        .set({
          nickname,
          occupation,
          traits,
          additionalInfo
        })
        .where(eq(users.id, user.id)); // or however you're identifying the current user
    } catch (err) {
      console.error('DB update error:', err);
      return message(form, 'Failed to update profile. Please try again.');
    }

    return message(form, 'Profile updated!');
  }
} satisfies Actions;