import * as auth from '$lib/server/auth.js';

import fs from 'node:fs/promises';
import { FILES_PATH } from '$env/static/private';

// Any files older than 3 hours should be deleted
const deleteOlderThan = 1000 * 60 * 60 * 3;

async function filesMaintenanceSubfolder(dir) {
	const list = await fs.readdir(`${FILES_PATH}/${dir}`);

	const deleteBefore = Date.now() - deleteOlderThan;

	for (let i = 0; i < list.length; i++) {
		const stat = await fs.stat(`${FILES_PATH}/${dir}/${list[i]}`);

		if (stat.isFile() && stat.mtime.getTime() < deleteBefore) {
			await fs.unlink(`${FILES_PATH}/${dir}/${list[i]}`);
		}
	}
}

async function filesMaintenance() {
	try {
		const list = await fs.readdir(FILES_PATH, { recursive: false });

		for (let i = 0; i < list.length; i++) {
			const stat = await fs.stat(`${FILES_PATH}/${list[i]}`);

			if (stat.isDirectory()) {
				const temp = await fs.stat(`${FILES_PATH}/${list[i]}/temp`);

				if (temp.isDirectory()) {
					filesMaintenanceSubfolder(`${list[i]}/temp`);
				}
			}
		}
	} catch (err) {
		console.error(err);
	}
}

// Run file maintenance every 30 minutes
setInterval(filesMaintenance, 1000 * 60 * 30);
// And when the app starts
filesMaintenance();

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

		event.locals.user = user;
		event.locals.session = session;
	} else {
		auth.deleteSessionCookie(event);

		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};
