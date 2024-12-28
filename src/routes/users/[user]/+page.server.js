import * as db from '$lib/server/db';
import * as auth from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';

export async function load(event) {
	const user = await db.getUser({ username: event.params.user });

	if (!user) {
		return error(404, 'User not found');
	}

	const posts = await db.getPosts({ user_id: user.id });

	return {
		account: user,
		posts: posts
	};
}
