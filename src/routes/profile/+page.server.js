import { hash, verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import db from '$lib/server/db';

export async function load(event) {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
}

export const actions = {
	update: async (event) => {
		if (!event.locals.user) {
			return fail(401);
		}

		const formData = await event.request.formData();
		const email = formData.get('email');

		if (!validateEmail(email)) {
			return fail(400, {
				message: 'Invalid email'
			});
		}

		if (formData.get('change_password')) {
			const new_password = formData.get('new_password');
			const confirm_password = formData.get('confirm_password');
			const current_password = formData.get('current_password');

			if (!validatePassword(new_password)) {
				return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
			}

			if (new_password !== confirm_password) {
				return fail(400, { message: 'Passwords do not match' });
			}

			const existingUser = await db('users')
				.where({
					id: event.locals.user.id
				})
				.first();

			if (!existingUser) {
				return fail(400, { message: 'Error while changing password' });
			}

			const samePassword = await verify(existingUser.password, new_password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			if (samePassword) {
				return fail(400, { message: 'New password cannot be the same as previous' });
			}

			const validPassword = await verify(existingUser.password, current_password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			if (!validPassword) {
				return fail(400, { message: 'Incorrect password' });
			}

			const passwordHash = await hash(new_password, {
				// recommended minimum parameters
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			try {
				await db('users')
					.where({
						id: event.locals.user.id
					})
					.update({
						password: passwordHash
					});
			} catch (e) {
				console.error(e);

				return fail(500, { message: 'An error has occurred while updating password' });
			}
		}

		try {
			await db('users')
				.where({
					id: event.locals.user.id
				})
				.update({
					email: email
				});
		} catch (e) {
			console.error(e);

			return fail(500, { message: 'An error has occurred' });
		}

		return redirect(302, '/');
	}
};

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
