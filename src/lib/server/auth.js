import db from '$lib/server/db';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

// How long the session should last, in days (defined above)
const sessionLength = 30;

// The cookie to store session tokens in
export const sessionCookieName = 'session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	const token = encodeBase32LowerCaseNoPadding(bytes);

	return token;
}

export async function createSession(token, userId) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const session = {
		id: sessionId,
		user_id: userId,
		expires_at: new Date(Date.now() + DAY_IN_MS * sessionLength)
	};

	await db('sessions').insert(session);

	return session;
}

export async function validateSessionToken(token) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const data = await db('sessions')
		.innerJoin('users', 'users.id', 'sessions.user_id')
		.where({
			'sessions.id': sessionId
		})
		.first(
			'sessions.id',
			'sessions.expires_at',
			'users.id as user_id',
			'users.username',
			'users.email'
		);

	if (!data) {
		return {
			session: null,
			user: null
		};
	}

	const session = {
		id: data.id,
		user_id: data.user_id,
		expires_at: new Date(data.expires_at)
	};
	const user = {
		id: data.user_id,
		username: data.username,
		email: data.email
	};

	if (Date.now() >= session.expires_at.getTime()) {
		// It it's expired, remove the DB entry and return empty session / user
		await db('sessions')
			.where({
				id: sessionId
			})
			.del();

		return {
			session: null,
			user: null
		};
	}

	if (Date.now() >= session.expires_at.getTime() - DAY_IN_MS * sessionLength * 0.5) {
		// If it's over halfway through the session length
		// Extend the expiry
		session.expires_at = new Date(Date.now() + DAY_IN_MS * sessionLength);

		await db('sessions').where({ id: sessionId }).update({
			expires_at: session.expires_at
		});
	}

	return {
		session: session,
		user: user
	};
}

export async function invalidateSession(sessionId) {
	await db('sessions')
		.where({
			id: sessionId
		})
		.del();
}

export function setSessionCookie(event, token, expiresAt) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionCookie(event) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
