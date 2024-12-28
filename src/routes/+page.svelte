<script>
	import { enhance } from '$app/forms';

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
		<p>{post.text}</p>
		<p>from <b>{post.user.username}</b></p>
		<hr />
	</blockquote>
{/each}
