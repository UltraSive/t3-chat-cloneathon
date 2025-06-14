import type { Actions } from './$types';

export const actions = {
	default: async ({ locals, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');
	}
} satisfies Actions;