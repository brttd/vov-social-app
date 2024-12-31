import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
	const user = await (await fetch(`/api/users/${params.user}?lookup=username`)).json();

	if (user.error) {
		return error(404, user.message || 'User not found');
	}

	const posts = (await (await fetch(`/api/posts?user=${user.data.id}`)).json()).data;

	return {
		account: user.data,
		posts: posts
	};
}
