<script>
	import Post from '$lib/Post.svelte';
	import FollowButton from '$lib/FollowButton.svelte';

	let { data } = $props();
</script>

<h1>{data.account.username}</h1>
<FollowButton {...data.account} />
<h3>({data.account.posts_count} posts)</h3>

<details>
	<summary>Following {data.following.length}</summary>
	{#each data.following as user}
		<p>
			<a href="/users/{user.username}">
				<b>{user.username}</b>
			</a>
			({user.posts_count} posts)
			<br />
			<FollowButton {...user} />
		</p>
	{/each}
	<hr />
</details>

<details>
	<summary>Followers {data.followers.length}</summary>
	{#each data.followers as user}
		<p>
			<a href="/users/{user.username}">
				<b>{user.username}</b>
			</a>
			({user.posts_count} posts)
			<br />
			<FollowButton {...user} />
		</p>
	{/each}
	<hr />
</details>

<h2>Posts...</h2>

{#each data.posts as post}
	<Post {...post} />
{/each}
