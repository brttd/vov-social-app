<script>
	import { post as validatePost } from '$lib/validate.js';
	import { invalidate } from '$app/navigation';

	import { PUBLIC_FILES_PREFIX } from '$env/static/public';

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
	let errorMessageTimeout = null;

	let files = $state([]);

	function showError(message, time = 5) {
		if (errorMessageTimeout) {
			clearTimeout(errorMessageTimeout);
		}

		errorMessage = message;

		errorMessageTimeout = setTimeout(() => {
			errorMessage = '';
		}, 1000 * time);
	}

	function post(event) {
		event.preventDefault();
		if (mode !== 'drafting') return;

		mode = 'posting';

		const data = {
			text: text,

			files: files.map((item) => item.url)
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

				showError('An error occurred! (' + error.message + ')');
			});
	}

	function uploadFile(file) {
		if (files.length > 10) {
			showError('Maximum 10 files');

			return false;
		}

		const formData = new FormData();

		formData.append('file', file);

		window
			.fetch('/api/posts/file-upload', {
				method: 'POST',

				body: formData
			})
			.then((response) => response.json())
			.then((result) => {
				if (!result.success) {
					throw new Error('Invalid file upload response');
				}

				files.push({
					url: result.data.file
				});
			})
			.catch((error) => {
				console.error(error);

				showError('Unable to upload file (' + error.message + ')');
			});
	}

	//File input listener
	function handleFileInputChange(event) {
		for (let i = 0; i < this.files.length; i++) {
			uploadFile(this.files[i]);
		}

		this.value = '';
	}
</script>

<form enctype="multipart/form-data">
	<textarea class:reply rows="4" bind:value={text} disabled={mode !== 'drafting'}></textarea>
	<br />
	<input
		type="file"
		accept="image/*"
		multiple="true"
		disabled={mode !== 'drafting'}
		onchange={handleFileInputChange}
	/>
	<br />
	{#if files.length > 0}
		<div>
			{#each files as file, idx (file.url)}
				<div>
					<img src={PUBLIC_FILES_PREFIX + file.url} />
					<button
						onclick={() => {
							files.splice(idx, 1);
						}}>Delete</button
					>
				</div>
			{/each}
		</div>
	{/if}

	<button onclick={post} disabled={!textValid || mode !== 'drafting'}>Post</button>
	{text.length} / 1024 characters
	{#if files.length > 0}
		<br />
		{files.length} / 10 files
	{/if}
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
	textarea {
		width: 100%;
		max-width: 100ch;
	}
	textarea.reply {
		max-width: 60ch;
	}
	img {
		display: inline-block;
		max-width: 256px;
		max-height: 256px;
	}
	p.error {
		color: red;
	}
</style>
