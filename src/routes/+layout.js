export async function load({ data, depends, fetch }) {
	if (data.user) {
		depends('app:notifications');

		return {
			user: data.user,

			notifications: (await (await fetch('/api/notifications')).json()).data
		};
	}
}
