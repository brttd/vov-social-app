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
	},

	post: async (event) => {
		if (!event.locals.user) {
			return fail(401);
		}

		const formData = await event.request.formData();
		const text = formData.get('text');

		if (!validatePostText(text)) {
			return fail(400, {
				message: 'Invalid text (min 3, max 1024 characters)'
			});
		}

		try {
			const newPost = await db.db('posts').insert({
				text: text,
				user_id: event.locals.user.id
			});
		} catch (e) {
			console.error(e);

			return fail(500, { message: 'An error has occurred' });
		}

		return redirect(302, '/');
	}
};

function validatePostText(text) {
	return typeof text === 'string' && text.length >= 3 && text.length <= 1024;
}
