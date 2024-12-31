<script>
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	import NewPostForm from '$lib/NewPostForm.svelte';
	import Post from '$lib/Post.svelte';

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
<hr />

<h2>New Post...</h2>
<NewPostForm />

<hr />

{#if data.posts.length === 0}
	<h2>No posts to show...</h2>
	<p>You need to <a href="/users">follow some other users...</a></p>
{:else}
	<h2>Posts</h2>

	{#each data.posts as post}
		<Post {...post} />
	{/each}
{/if}
