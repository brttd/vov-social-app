import { extname } from 'path';
import { writeFile, mkdir } from 'node:fs/promises';
import { error, json } from '@sveltejs/kit';
import db from '$lib/server/db';
import { FILES_PATH } from '$env/static/private';
import sharp from 'sharp';

export async function POST({ request, locals, url }) {
	if (!locals.user) {
		return error(403, {
			error: true,
			message: 'You need to be logged in before posting'
		});
	}

	const data = await request.formData();

	if (!data) {
		return error(400, {
			error: true,
			message: 'Invalid submission'
		});
	}

	const file = data.get('file');

	if (!file) {
		return error(400, {
			error: true,
			field: 'file',
			message: 'Invalid file'
		});
	}

	const filename = `${crypto.randomUUID()}.png`;

	// TODO: Use a (fully) temporary directory to process image file
	// And then move it to a web-accessible location

	const folder = `${locals.user.id}/temp`;

	const filepath = `${folder}/${filename}`;

	await mkdir(`${FILES_PATH}/${folder}`, { recursive: true });

	const fileData = await file.arrayBuffer();

	await sharp(fileData)
		.resize(1024, 1024, {
			fit: 'inside',
			withoutEnlargement: true
		})
		.png({
			progressive: true
		})
		.toFile(`${FILES_PATH}/${filepath}`);

	return json({
		success: true,
		data: {
			file: filepath
		}
	});
}
