<script>
	import { page } from '$app/state';

	import ErrorDisplay from '$lib/ErrorDisplay.svelte';

	import { onMount } from 'svelte';

	import { invalidate } from '$app/navigation';

	let email = $state('');

	let mode = $state('typing');

	let ErrorMessage = $state(null);

	function saveChange(event) {
		event.preventDefault();

		if (mode !== 'typing' && mode !== 'saved') {
			return false;
		}

		mode = 'saving';
		ErrorMessage.hideError();

		fetch('/api/account/change-email', {
			method: 'POST',

			body: JSON.stringify({
				email: email.trim().toLowerCase()
			}),

			headers: {
				'content-type': 'application/json'
			}
		})
			.then((response) => response.json())
			.then((result) => {
				if (result.success) {
					mode = 'saved';

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
		if (page.data.user && page.data.user.email) {
			email = page.data.user.email;
		}
	});
</script>

<form>
	<input type="email" bind:value={email} />
	<button type="submit" onclick={saveChange}>Change</button>
	{#if mode === 'saving'}
		<p>Saving...</p>
	{:else if mode === 'saved'}
		<p>Saved...</p>
	{/if}
</form>

<ErrorDisplay bind:this={ErrorMessage} />
