<script>
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	import FollowButton from '$lib/FollowButton.svelte';

	let { data } = $props();

	/*
	onMount(() => {
		// Every 30 seconds, reload the posts list
		const timer = setInterval(() => {
			invalidate('app:posts');
		}, 1000 * 30);

		return () => {
			clearInterval(timer);
		};
	});
	*/
</script>

<h1>Users</h1>

{#each data.users as user}
	<p>
		<a href="/users/{user.username}">
			<b>{user.username}</b>
		</a>
		({user.posts_count} posts)
		<br />
		<FollowButton {...user} />
	</p>
{/each}
