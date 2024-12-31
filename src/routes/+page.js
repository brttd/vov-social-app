import { redirect } from '@sveltejs/kit';

export async function load({ parent, depends, fetch }) {
	const layout = await parent();

	if (!layout.user) {
		return redirect(302, '/login');
	}

	depends('app:posts');

	return {
		posts: (await (await fetch('/api/posts')).json()).data
	};
}
