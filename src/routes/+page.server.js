import * as db from '$lib/server/db';
import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export async function load(event) {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const users = await db.getUsers();

	const posts = await db.getPosts();

	return {
		user: event.locals.user,

		users: users.map((entry) => {
			return { ...entry };
		}),
		posts: posts.map((entry) => {
			return { ...entry };
		})
	};
}

export const actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}

		await auth.invalidateSession(event.locals.session.id);

		auth.deleteSessionCookie(event);

		return redirect(302, '/login');
	}
};
