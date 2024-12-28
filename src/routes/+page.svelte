<script>
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<h1>Hi, {data.user.username}!</h1>
<p>Your user ID is {data.user.id}.</p>
<form method="post" action="?/logout" use:enhance>
	<button>Sign out</button>
</form>
<hr />

<h2>Users</h2>

{#each data.users as user}
	{#if user.email}
		<p>{user.username} <code>({user.email})</code></p>
	{:else}
		<p>{user.username}</p>
	{/if}
{/each}

<h2>Posts</h2>

{#each data.posts as post}
	<p>{post.text}</p>
	<p>from <b>{post.user.username}</b></p>
{/each}
