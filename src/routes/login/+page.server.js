import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import * as db from '$lib/server/db';

export const load = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}

	return {};
};

export const actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, {
				message: 'Invalid username (min 3, max 31 characters, alphanumeric only)'
			});
		}

		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
		}

		const existingUser = await db
			.db('users')
			.where({
				username: username
			})
			.first();

		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const validPassword = await verify(existingUser.password, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!validPassword) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const sessionToken = auth.generateSessionToken();

		const session = await auth.createSession(sessionToken, existingUser.id);

		auth.setSessionCookie(event, sessionToken, session.expires_at);

		return redirect(302, '/');
	},

	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, { message: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		const existingUser = await db
			.db('users')
			.where({
				username: username
			})
			.first();

		if (existingUser) {
			return fail(400, { message: 'Username already in use' });
		}

		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			const newUser = await db.db('users').insert({
				username: username,
				password: passwordHash
			});

			const userId = newUser[0];

			const sessionToken = auth.generateSessionToken();

			const session = await auth.createSession(sessionToken, userId);

			auth.setSessionCookie(event, sessionToken, session.expires_at);
		} catch (e) {
			console.error(e);

			return fail(500, { message: 'An error has occurred' });
		}

		return redirect(302, '/');
	}
};

function validateUsername(username) {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}

function validatePassword(password) {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
