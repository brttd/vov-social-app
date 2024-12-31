<script>
	import Time from 'svelte-time';

	import { page } from '$app/state';

	const { preview = true, id, text, user, created_at, updated_at } = $props();
</script>

<blockquote>
	{#if preview}
		<a href="/posts/{id}"><pre>{text}</pre></a>
	{:else}
		<pre>{text}</pre>
	{/if}
</blockquote>

<p>
	{#if page.data.user && page.data.user.id === user.id}
		<b>{user.username}</b>
	{:else}
		<a href="/users/{user.username}">
			<b>{user.username}</b>
		</a>
	{/if}
	<Time relative timestamp={created_at} />
</p>
<hr />
