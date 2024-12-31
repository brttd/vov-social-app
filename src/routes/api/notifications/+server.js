import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function GET({ locals, fetch, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in to get notifications'
		});
	}

	const data = await db('user_notifications')
		.orderBy('created_at', 'desc')
		.where({
			user_id: locals.user.id,
			seen: false
		})
		.select(['id', 'text', 'created_at']);

	// Use a temporary cache, if multiple notifications reference the same user/post
	const userData = new Map();
	const postData = new Map();

	return json({
		start: 0,
		length: data.length,
		total: data.length,

		data: await Promise.all(
			data.map(async (entry) => {
				const newEntry = {
					id: entry.id,
					text: entry.text,

					created_at: entry.created_at,

					users: [],
					posts: []
				};

				const userRefs = [...entry.text.matchAll(/\{user:(\d+)\}/g)];

				for (let i = 0; i < userRefs.length; i++) {
					const id = userRefs[i][1];

					if (userData.get(id)) {
						newEntry.users.push(userData.get(id));
					} else {
						const user = (await (await fetch('/api/users/' + id)).json()).data;

						userData.set(id, user);

						newEntry.users.push(user);
					}
				}

				const postRefs = [...entry.text.matchAll(/\{post:(\d+)\}/g)];

				for (let i = 0; i < postRefs.length; i++) {
					const id = postRefs[i][1];

					if (postData.get(id)) {
						newEntry.posts.push(postData.get(id));
					} else {
						const post = (await (await fetch(`/api/posts/${id}`)).json()).data;

						postData.set(id, post);

						newEntry.posts.push(post);
					}
				}

				return newEntry;
			})
		)
	});
}
