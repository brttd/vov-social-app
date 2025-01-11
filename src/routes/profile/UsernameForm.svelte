<script>
	import { page } from '$app/state';

	import ErrorDisplay from '$lib/ErrorDisplay.svelte';

	import { onMount } from 'svelte';

	import { invalidate } from '$app/navigation';

	let username = $state('');

	let mode = $state('typing');

	let ErrorMessage = $state(null);

	function saveChange(event) {
		event.preventDefault();

		if (mode !== 'typing' && mode !== 'saved') {
			return false;
		}

		mode = 'saving';
		ErrorMessage.hideError();

		fetch('/api/account/change-username', {
			method: 'POST',

			body: JSON.stringify({
				username: username.trim().toLowerCase()
			}),

			headers: {
				'content-type': 'application/json'
			}
		})
			.then((response) => response.json())
			.then((result) => {
				if (result.success) {
					mode = 'saved';

					invalidate('app:user');

					setTimeout(() => {
						if (mode === 'saved') {
							mode = 'typing';
						}
					}, 1000 * 10);
				} else {
					throw new Error(result.message);
				}
			})
			.catch((error) => {
				mode = 'typing';

				console.error(error);

				ErrorMessage.showError('An error occurred! (' + error.message + ')');
			});
	}

	onMount(() => {
		if (page.data.user && page.data.user.username) {
			username = page.data.user.username;
		}
	});
</script>

<form>
	<input type="text" bind:value={username} />
	<button type="submit" onclick={saveChange}>Change</button>
	{#if mode === 'saving'}
		<p>Saving...</p>
	{:else if mode === 'saved'}
		<p>Saved...</p>
	{/if}
</form>

<ErrorDisplay bind:this={ErrorMessage} />
