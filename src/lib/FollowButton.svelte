<script>
	import { page } from '$app/state';

	let { id, following = false } = $props();

	const isSelf = page.data.user && page.data.user.id === id;

	let mode = $state('');
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

	function toggle() {
		mode = 'updating';

		fetch(following ? '/api/follows/unfollow' : '/api/follows/follow', {
			method: 'POST',

			body: JSON.stringify({ id: id }),

			headers: {
				'content-type': 'application/json'
			}
		})
			.then((response) => response.json())
			.then((result) => {
				mode = '';

				if (result.success) {
					following = !following;
				} else {
					mode = '';

					throw new Error(result.message);
				}
			})
			.catch((error) => {
				mode = '';

				console.error(error);

				showError('An error occurred! (' + error.message + ')');
			});
	}
</script>

{#if isSelf}
	<!-- can't follow yourself -->{:else}
	<button disabled={mode === 'updating'} onclick={toggle}>
		{#if following}
			{#if mode === 'updating'}
				Unfollowing...
			{:else}
				Unfollow
			{/if}
		{:else if mode === 'updating'}
			Following...
		{:else}
			Follow
		{/if}
	</button>

	{#if errorMessage}
		<br />
		<p class="error">{errorMessage}</p>
	{/if}
{/if}

<style>
	.error {
		color: red;
	}
</style>
