import { FILES_PATH } from '$env/static/private';
import { error } from '@sveltejs/kit';

import fs from 'node:fs/promises';
import path from 'path';

import mime from 'mime-types';

export async function GET({ locals, params }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before viewing files'
		});
	}

	const filePath = path.resolve(FILES_PATH, path.normalize(params.path));

	// If path has been modified to a different directory
	if (!filePath.startsWith(path.normalize(FILES_PATH))) {
		// Then refuse to serve that file
		return error(403, {
			error: true,
			message: 'Invalid path'
		});
	}

	const ext = path.extname(filePath);

	const type = mime.lookup(ext);

	if (!type.startsWith('image/')) {
		return error(403, {
			error: true,
			message: 'Only image files allowed'
		});
	}

	try {
		const data = await fs.readFile(filePath);

		return new Response(data, {
			status: 200,

			headers: {
				'x-vov-files': 'yep',
				'Content-Type': type
			}
		});
	} catch (error) {
		// Handle errors, like file not found
		return error(404, {
			error: true,
			message: 'File not found'
		});
	}
}
