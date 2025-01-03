export async function load({ data, depends, fetch }) {
	if (data.user) {
		depends('app:notifications');

		depends('app:reactions');

		return {
			user: data.user,

			reactions: (await (await fetch('/api/reactions')).json()).data,

			notifications: (await (await fetch('/api/notifications')).json()).data
		};
	}
}
