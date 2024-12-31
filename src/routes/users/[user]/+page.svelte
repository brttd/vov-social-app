<script>
	import Post from '$lib/Post.svelte';
	import FollowButton from '$lib/FollowButton.svelte';

	let { data } = $props();
</script>

<h1>{data.account.username}</h1>
<h3>({data.account.posts_count} posts)</h3>
<FollowButton {...data.account} />

<h2>Posts...</h2>

{#each data.posts as post}
	<Post {...post} />
{/each}
