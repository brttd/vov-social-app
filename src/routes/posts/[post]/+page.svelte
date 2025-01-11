<script>
	import Post from '$lib/Post.svelte';
	import NewPostForm from '$lib/NewPostForm.svelte';

	let { data } = $props();
</script>

<h1><a href="/users/{data.post.user.username}">{data.post.user.username}</a></h1>

<Post {...data.post} preview={false} />

<h3>Reply...</h3>

<NewPostForm reply={data.post.id} />

<div class="post-container">
	{#each data.replies as reply}
		<Post {...reply} reply={true} />
	{/each}
</div>
