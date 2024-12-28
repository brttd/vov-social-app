import * as auth from '$lib/server/auth.js';

export const handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionCookie(event, sessionToken, session.expires_at);
	} else {
		auth.deleteSessionCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
