import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';
import * as validate from '$lib/validate.js';

import { hash, verify } from '@node-rs/argon2';
import * as auth from '$lib/server/auth';

export async function POST({ request, locals, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before changing your password'
		});
	}

	const data = await request.json();

	const new_password = data.new_password;
	const confirm_password = data.confirm_password;
	const current_password = data.current_password;

	if (typeof new_password !== 'string') {
		return error(400, {
			error: true,
			field: 'new_password',
			message: 'New password field must be a string'
		});
	}

	if (typeof confirm_password !== 'string') {
		return error(400, {
			error: true,
			field: 'confirm_password',
			message: 'Confirm password field must be a string'
		});
	}

	if (typeof current_password !== 'string') {
		return error(400, {
			error: true,
			field: 'current_password',
			message: 'Current password field must be a string'
		});
	}

	if (!validate.user.password(new_password)) {
		return error(400, {
			error: true,
			field: 'new_password',
			message: 'Invalid password (min 6, max 255 characters)'
		});
	}

	if (new_password !== confirm_password) {
		return error(400, {
			error: true,
			field: 'confirm_password',
			message: 'Password confirmation does not match'
		});
	}

	const existingUser = await db('users')
		.where({
			id: locals.user.id
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
		return error(400, {
			error: true,
			field: 'new_password',
			message: 'New password cannot be the same as the previous one'
		});
	}

	const validPassword = await verify(existingUser.password, current_password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	if (!validPassword) {
		return error(400, {
			error: true,
			field: 'current_password',
			message: 'Current password incorrect'
		});
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
				id: locals.user.id
			})
			.update({
				password: passwordHash
			});

		return json({
			success: true
		});
	} catch (e) {
		console.error(e);

		return error(400, {
			error: true,
			field: 'current_password',
			message: 'Something went wrong'
		});
	}
}
