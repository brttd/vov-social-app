import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
	const post = await (await fetch(`/api/posts/${params.post}`)).json();

	if (post.error) {
		return error(404, post.message || 'Post not found');
	}

	return {
		post: post.data
	};
}
