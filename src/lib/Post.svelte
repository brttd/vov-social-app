<script>
	import { post as validatePost } from '$lib/validate.js';
	import Time from 'svelte-time';

	import { page } from '$app/state';

	let { preview = true, reply = false, id, text, user, created_at, updated_at } = $props();

	const editable = page.data.user && page.data.user.id === user.id;

	let editing = $state(false);

	let newText = $state(text);
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
</script>

{#if editable && editing}
	<form>
		<textarea bind:value={newText} disabled={mode !== 'drafting'}></textarea>
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
			<a href="/posts/{id}"><pre>{text}</pre></a>
		{:else}
			<pre>{text}</pre>
		{/if}
	</blockquote>
{/if}

<p>
	{#if editable}
		<button
			disabled={mode === 'updating' || mode === 'updated'}
			onclick={() => {
				editing = !editing;
			}}>{editing ? 'Cancel' : 'Edit'}</button
		>
		<b>{user.username}</b>
	{:else}
		<a href="/users/{user.username}">
			<b>{user.username}</b>
		</a>
	{/if}
	<Time relative timestamp={created_at} />
</p>
<hr />

<style>
	.error {
		color: red;
	}
</style>
