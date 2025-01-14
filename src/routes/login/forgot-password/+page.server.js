import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import db from '$lib/server/db';

import * as emailer from '$lib/server/email';

export const load = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}

	const token = event.url.searchParams.get('token');

	if (token) {
		try {
			const password_reset = await db('password_reset').where({ token: token }).first();

			if (!password_reset) {
				return {
					token: token,
					validToken: false
				};
			}

			const expiresAt = new Date(password_reset.expires_at);

			if (Date.now() >= expiresAt.getTime()) {
				return {
					token: token,
					validToken: false
				};
			}

			const existingUser = await db('users')
				.where({
					id: password_reset.user_id
				})
				.first();

			if (existingUser) {
				return {
					token: token,
					validToken: true
				};
			}
		} catch (e) {
			console.error(e);
		}
	}

	return {
		token: token,
		validToken: false
	};
};

export const actions = {
	forgot: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');

		if (!validateUsername(username) && !validateEmail(username)) {
			return fail(400, {
				message: 'Invalid username / email'
			});
		}

		const existingUser = await db('users')
			.where({
				username: username
			})
			.orWhere({
				email: username
			})
			.first();

		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or email' });
		}

		if (!existingUser.email) {
			return fail(400, { message: 'Account does not have an email address set' });
		}

		try {
			// Remove any exisiting password reset tokens
			await db('password_reset')
				.where({
					user_id: existingUser.id
				})
				.del();

			// Create a new reset token
			const token = generateToken();

			await db('password_reset').insert({
				user_id: existingUser.id,
				token: token,
				expires_at: new Date(Date.now() + 1000 * 60 * 60 * 2) // Make token work for 2 hours
			});

			emailer.send({
				to: existingUser.email,
				subject: 'VOVLE password reset',
				text: 'Reset your password now... https://vovle.me/login/forgot-password/?token=' + token
			});
		} catch (e) {
			console.error(e);

			return fail(500, { message: 'Something went wrong' });
		}

		return {
			success: true
		};
	},

	reset: async (event) => {
		const formData = await event.request.formData();
		const token = formData.get('token');
		const password = formData.get('password');

		if (!validatePassword(password)) {
			return fail(400, {
				message: 'Invalid password (min 6, max 255 characters)'
			});
		}

		try {
			const password_reset = await db('password_reset').where({ token: token }).first();

			if (!password_reset) {
				return fail(400, { message: 'Reset password token not valid' });
			}

			const expiresAt = new Date(password_reset.expires_at);

			if (Date.now() >= expiresAt.getTime()) {
				return fail(400, { message: 'Reset password token has expired' });
			}

			const existingUser = await db('users')
				.where({
					id: password_reset.user_id
				})
				.first();

			if (!existingUser) {
				return fail(400, { message: 'Reset password token not valid - user not found' });
			}

			const passwordHash = await hash(password, {
				// recommended minimum parameters
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			await db('users').where({ id: password_reset.user_id }).update({ password: passwordHash });

			// Remove the password reset token(s)
			await db('password_reset')
				.where({
					user_id: password_reset.user_id
				})
				.del();
		} catch (e) {
			return fail(500, { message: 'Something went wrong' });
		}

		return { success: true };
	}
};

function generateToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	const token = encodeBase32LowerCaseNoPadding(bytes);

	return token;
}

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

function validateEmail(email) {
	// TODO: Do something better than regex validation
	return (
		typeof email === 'string' &&
		email.length > 3 &&
		email.length <= 255 &&
		email
			.toLowerCase()
			.match(
				/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
			)
	);
}
