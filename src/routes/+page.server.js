import db from '$lib/server/db/index';
import * as schema from '$lib/server/db/schema';

export async function load({ params }) {
	const data = await db.select().from(schema.users);

	return { users: data };
}
