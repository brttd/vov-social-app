import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export async function GET() {
	const data = await db('reactions').select(['id', 'text']);

	return json({
		success: true,

		data: data.map((item) => {
			return { id: item.id, text: item.text };
		})
	});
}
