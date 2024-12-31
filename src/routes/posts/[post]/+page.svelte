<script>
	import Post from '$lib/Post.svelte';

	let { data } = $props();
</script>

<h1><a href="/users/{data.post.user.username}">{data.post.user.username}</a></h1>

<Post {...data.post} preview={false} />
