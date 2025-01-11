export async function load({ locals, depends }) {
	depends('app:user');

	return {
		user: locals.user
	};
}
