import { redirect } from '@sveltejs/kit';

export async function load({ parent, depends, fetch }) {
	const layout = await parent();

	if (!layout.user) {
		return redirect(302, '/login');
	}

	depends('app:users');

	return {
		users: (await (await fetch('/api/users')).json()).data
	};
}
