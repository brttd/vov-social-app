<script>
	import { post as validatePost } from '$lib/validate.js';
	import { invalidate } from '$app/navigation';

	const { reply } = $props();

	let text = $state('');
	let textValid = $derived(validatePost.text(text));

	// 'drafting': User is typing new post
	// 'posting': Post has been sent to server, awaiting success/response
	// 'posted': Post has been succesfully sent to server, success message showing
	// (after 'posting' is shown for a short time, it resets to 'drafting')
	let mode = $state('drafting');

	let postId = $state(null);

	let errorMessage = $state('');

	function post(event) {
		event.preventDefault();
		if (mode !== 'drafting') return;

		errorMessage = '';

		mode = 'posting';

		const data = {
			text: text
		};

		if (reply) {
			data.reply_to = reply;
		}

		fetch('/api/posts', {
			method: 'POST',

			body: JSON.stringify(data),

			headers: {
				'content-type': 'application/json'
			}
		})
			.then((response) => response.json())
			.then((result) => {
				if (result.success) {
					text = '';

					mode = 'posted';

					if (reply) {
						invalidate('app:posts:' + reply);
					} else {
						invalidate('app:posts');
					}

					postId = result.data.id;

					setTimeout(() => {
						mode = 'drafting';
					}, 1000 * 5);
				} else {
					mode = 'drafting';

					throw new Error(result.message);
				}
			})
			.catch((error) => {
				console.error(error);

				errorMessage = 'An error occurred! (' + error.message + ')';
			});
	}
</script>

<form>
	<textarea bind:value={text} disabled={mode !== 'drafting'}></textarea>
	<br />
	<button onclick={post} disabled={!textValid || mode !== 'drafting'}>Post</button>
	{text.length} / 1024 characters
</form>
{#if mode === 'posting'}
	<p>Posting...</p>
{:else if mode === 'posted'}
	{#if postId}
		<p>Posted! <a href="/posts/{postId}">View your post</a></p>
	{:else}
		<p>Posted!</p>
	{/if}
{/if}
{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}

<style>
	p.error {
		color: red;
	}
</style>
