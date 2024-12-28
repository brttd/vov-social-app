<script>
	import Time from 'svelte-time';

	let { data } = $props();
</script>

<a href="/">Home</a>

<h1>{data.account.username}</h1>

<h2>Posts...</h2>

{#each data.posts as post}
	<blockquote>
		<pre>{post.text}</pre>
	</blockquote>
	<p><b>{post.user.username}</b> <Time relative timestamp={post.created_at} /></p>
	<hr />
{/each}
