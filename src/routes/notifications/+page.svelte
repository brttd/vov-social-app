<script>
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	import { invalidate } from '$app/navigation';

	import * as he from 'he';

	const { data } = $props();

	const list = $state([]);

	function formatText(notification) {
		let text = he.encode(notification.text);

		for (let i = 0; i < notification.users.length; i++) {
			text = text.replace(
				`{user:${notification.users[i].id}}`,
				`<a href="/users/${notification.users[i].username}">${notification.users[i].username}</a>`
			);
		}

		for (let i = 0; i < notification.posts.length; i++) {
			text = text.replace(
				`{post:${notification.posts[i].id}}`,
				`<a href="/posts/${notification.posts[i].id}">post</a>`
			);
		}

		return text;
	}

	function seenNotification(id) {
		fetch('/api/notifications/seen', {
			method: 'POST',

			body: JSON.stringify({ id: id }),

			headers: {
				'content-type': 'application/json'
			}
		})
			.then(() => {
				invalidate('app:notifications');
			})
			.catch((error) => {
				console.error(error);
			});
	}

	onMount(() => {
		for (let i = 0; i < data.notifications.length; i++) {
			list.push(data.notifications[i]);
		}
	});
</script>

{#each list as notification, index (notification.id)}
	<div>
		<p
			onclick={() => {
				seenNotification(notification.id);
				list.splice(index, 1);
			}}
		>
			{@html formatText(notification)}
		</p>
		<button
			onclick={() => {
				seenNotification(notification.id);
				list.splice(index, 1);
			}}>Hide</button
		>
		<hr />
	</div>
{/each}
