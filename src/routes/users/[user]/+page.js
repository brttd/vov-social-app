import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
	const user = await (await fetch(`/api/users/${params.user}?lookup=username`)).json();

	if (user.error) {
		return error(404, user.message || 'User not found');
	}

	const posts = (await (await fetch(`/api/posts?user=${user.data.id}`)).json()).data;

	const followers = (await (await fetch(`/api/users/${user.data.id}/followers`)).json()).data;
	const following = (await (await fetch(`/api/users/${user.data.id}/following`)).json()).data;
	const history = (await (await fetch(`/api/users/${user.data.id}/history`)).json()).data;

	return {
		account: user.data,
		posts: posts,
		followers: followers,
		following: following,
		history: history
	};
}
