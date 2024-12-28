<script>
	let { data } = $props();
</script>

<h1>Users</h1>

{#each data.users as user}
	{#if user.email}
		<p>{user.name} <code>({user.email})</code></p>
	{:else}
		<p>{user.name}</p>
	{/if}
{/each}

<h1>Posts</h1>

{#each data.posts as post}
	<p>{post.text}</p>
	<p>from <b>{post.user.name}</b></p>
{/each}
