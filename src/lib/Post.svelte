<script>
	import { post as validatePost } from '$lib/validate.js';
	import Time from 'svelte-time';
	import Reactions from '$lib/Reactions.svelte';

	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let {
		preview = true,
		reply = false,
		reply_count = 0,
		id,
		text,
		user,
		created_at,
		updated_at,
		reaction,
		reactions,
		media = [],
		edits = []
	} = $props();

	const editable = page.data.user && page.data.user.id === user.id;

	let editing = $state(false);

	let newText = $state('');
	let textValid = $derived(validatePost.text(text));

	// 'drafting': User is typing updating post
	// 'updating': Post has been sent to server, awaiting success/response
	// 'updated': Post has been succesfully sent to server, success message showing
	// (after 'updated' is shown for a short time, it resets to 'drafting' + editing = false)
	let mode = $state('drafting');

	let postId = $state(null);

	let errorMessage = $state('');
	let errorMessageTimeout = null;

	function showError(message) {
		if (errorMessageTimeout) {
			clearTimeout(errorMessageTimeout);
		}

		errorMessage = message;

		errorMessageTimeout = setTimeout(() => {
			errorMessage = '';
		}, 1000 * 5);
	}

	function updatePost(event) {
		event.preventDefault();
		if (mode !== 'drafting') return;

		errorMessage = '';

		mode = 'updating';

		fetch('/api/posts', {
			method: 'PATCH',

			body: JSON.stringify({ id: id, text: newText }),

			headers: {
				'content-type': 'application/json'
			}
		})
			.then((response) => response.json())
			.then((result) => {
				if (result.success) {
					mode = 'updated';

					text = newText;

					setTimeout(() => {
						mode = 'drafting';
						editing = false;
					}, 1000 * 3);
				} else {
					mode = 'drafting';

					throw new Error(result.message);
				}
			})
			.catch((error) => {
				mode = 'drafting';
				console.error(error);

				showError('An error occurred! (' + error.message + ')');
			});
	}

	function deletePost() {}

	onMount(() => {
		newText = text;
	});
</script>

<div class="vovle">
	{#if editable && editing}
		<form>
			<textarea rows="4" bind:value={newText} disabled={mode !== 'drafting'}></textarea>
			<br />
			<button onclick={updatePost} disabled={!textValid || mode !== 'drafting'}>Update</button>
			{#if mode === 'updating'}
				<span>Updating...</span>
			{:else if mode === 'updated'}
				<span>Updated!</span>
			{/if}
			{#if errorMessage}
				<span class="error">{errorMessage}</span>
			{/if}
		</form>
	{:else}
		<blockquote>
			{#if preview && !reply}
				<a class="vovle-link" href="/posts/{id}"><div class="post-link"><pre>{text}</pre></div></a>
			{:else}
				<pre>{text}</pre>
			{/if}
		</blockquote>
	{/if}

	<div class="post-interactables">
		{#if media && media.length > 0}
			<div class="media">
				{#each media as file (file.url)}
					<img src={'/user-upload/' + file.url} />
				{/each}
			</div>
		{/if}

		{#if !editing && edits && edits.length > 0}
			<details>
				<summary>Edited {edits.length} times</summary>
				{#each edits as edit}
					<blockquote><pre>{edit.text}</pre></blockquote>
					<hr />
				{/each}
			</details>
		{/if}
		<p class="post-attribution">
			{#if editable}
				<b>{user.username}</b>
				<button
					disabled={mode === 'updating' || mode === 'updated'}
					onclick={() => {
						editing = !editing;
					}}
					>{editing ? 'Cancel' : 'Edit'}
				</button>
			{:else}
				<a class="username" href="/users/{user.username}">
					<b>{user.username}</b>
				</a>
			{/if}
		</p>
		<div class="vovle-time"><Time relative timestamp={created_at} /></div>
		<Reactions post_id={id} {reaction} {reactions} />
		{#if preview && !reply}
			{reply_count} replies
		{/if}
	</div>
</div>

<style>
	.vovle-link {
		text-decoration: none;
		color: black;
		padding: 7px 0 7px 0;
		display: block;
		cursor: default;
	}

	blockquote {
		margin: 0;
		padding: 0;
	}

	.vovle-time {
		color: grey;
		font-size: small;
	}

	.vovle {
		width: 87vw;
		padding: 1px 10px 10px 10px;
		background-color: white;
		margin: 7px;
		border-radius: 4px;
	}

	.post-interactables {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.username {
		color: #242031;
		text-decoration: none;
	}

	textarea {
		width: 100%;
		max-width: 100ch;
	}
	pre {
		font-family: sans-serif;
		max-width: 100%;
		white-space: pre-wrap;
	}
	.media {
		max-width: 512px;
	}
	img {
		display: inline-block;
	}
	.error {
		color: red;
	}
	.post-attribution {
		margin: 0;
		display: inline-block;
		vertical-align: top;
	}
</style>
