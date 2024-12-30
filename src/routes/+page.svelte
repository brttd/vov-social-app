<script>
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	import Time from 'svelte-time';

	let { data, form } = $props();

	onMount(() => {
		// Every 30 seconds, reload the posts list
		const timer = setInterval(() => {
			invalidate('app:posts');
		}, 1000 * 30);

		return () => {
			clearInterval(timer);
		};
	});
</script>

<h1>Hi, {data.user.username}!</h1>
<p>Your user ID is {data.user.id}.</p>
<hr />

<h2>New Post...</h2>
<form method="post" action="?/post" use:enhance>
	<textarea name="text"></textarea>
	<button>Post</button>
</form>
<p style="color: red">{form?.message ?? ''}</p>

<hr />

<details>
	<summary><b>Users</b></summary>

	{#each data.users as user}
		<p>
			<a href="/users/{user.username}">
				{user.username}
				{#if user.email}
					<code>({user.email})</code>
				{/if}
			</a>
		</p>
	{/each}
</details>

<h2>Posts</h2>

{#each data.posts as post}
	<blockquote>
		<pre>{post.text}</pre>
	</blockquote>
	<p>
		<a href="/users/{post.user.username}">
			<b>{post.user.username}</b>
		</a>
		<Time relative timestamp={post.created_at} />
	</p>
	<hr />
{/each}
