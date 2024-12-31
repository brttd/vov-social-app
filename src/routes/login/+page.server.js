import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import db from '$lib/server/db';

import * as validate from '$lib/validate.js';

import * as emailer from '$lib/server/email';

export const load = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}

	return {};
};

export const actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username').toLowerCase();
		const password = formData.get('password');

		if (!validate.user.username(username)) {
			return fail(400, {
				message: 'Invalid username (min 3, max 31 characters, alphanumeric only)'
			});
		}

		if (!validate.user.password(password)) {
			return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
		}

		const existingUser = await db('users')
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

		let username = formData.get('username').toLowerCase();
		let email = formData.get('email');
		let password = formData.get('password');

		if (!validate.user.username(username)) {
			return fail(400, {
				message: 'Invalid username (min 3, max 31 characters, alphanumeric only)'
			});
		}
		if (!validate.user.email(email)) {
			return fail(400, {
				message: 'Invalid email'
			});
		}
		if (!validate.user.password(password)) {
			return fail(400, {
				message: 'Invalid password (min 6, max 255 characters)'
			});
		}

		username = username.trim();
		email = email.trim();
		password = password.trim();

		const existingUser = await db('users')
			.where({
				username: username
			})
			.orWhere({ email: email })
			.first();

		if (existingUser) {
			return fail(400, { message: 'Username or email already in use' });
		}

		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			const newUser = await db('users').insert({
				username: username,
				email: email,
				password: passwordHash
			});

			const userId = newUser[0];

			const sessionToken = auth.generateSessionToken();

			const session = await auth.createSession(sessionToken, userId);

			auth.setSessionCookie(event, sessionToken, session.expires_at);

			/*
			This isn't needed
			emailer.send({
				to: email,
				subject: 'VOVLE Account Created!',
				text: 'Welcome to VOVLE'
			});
			*/
		} catch (e) {
			console.error(e);

			return fail(500, { message: 'An error has occurred' });
		}

		return redirect(302, '/');
	}
};
