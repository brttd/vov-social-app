<script>
	import { enhance } from '$app/forms';

	import Time from 'svelte-time';

	let { data, form } = $props();
</script>

<h1>Hi, {data.user.username}!</h1>
<p>Your user ID is {data.user.id}.</p>
<form method="post" action="?/logout" use:enhance>
	<button>Sign out</button>
</form>
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
		{#if user.email}
			<p>{user.username} <code>({user.email})</code></p>
		{:else}
			<p>{user.username}</p>
		{/if}
	{/each}
</details>

<h2>Posts</h2>

{#each data.posts as post}
	<blockquote>
		<pre>{post.text}</pre>
	</blockquote>
	<p><b>{post.user.username}</b> <Time relative timestamp={post.created_at} /></p>
	<hr />
{/each}
