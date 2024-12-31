import * as auth from '$lib/server/auth';

export const actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}

		await auth.invalidateSession(event.locals.session.id);

		auth.deleteSessionCookie(event);

		return redirect(302, '/login');
	}
};
