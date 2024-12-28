import * as db from '$lib/server/db';

export async function load({ params }) {
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
