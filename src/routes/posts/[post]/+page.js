import { error, redirect } from '@sveltejs/kit';

export async function load({ params, depends, fetch }) {
	const post = await (await fetch(`/api/posts/${params.post}`)).json();

	if (post.error || !post.data) {
		return error(404, post.message || 'Post not found');
	}

	if (post.data.reply_to) {
		redirect(302, `/posts/${post.data.reply_to}`);
	}

	depends('app:posts:' + post.data.id);

	return {
		post: post.data,
		replies: (await (await fetch(`/api/posts?reply=${post.data.id}`)).json()).data
	};
}
