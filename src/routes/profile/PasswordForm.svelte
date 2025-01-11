<script>
	import ErrorDisplay from '$lib/ErrorDisplay.svelte';

	let new_password = $state('');
	let confirm_password = $state('');
	let current_password = $state('');

	let mode = $state('typing');

	let ErrorMessage = $state(null);

	function saveChange(event) {
		event.preventDefault();

		if (mode !== 'typing' && mode !== 'saved') {
			return false;
		}

		mode = 'saving';
		ErrorMessage.hideError();

		fetch('/api/account/change-password', {
			method: 'POST',

			body: JSON.stringify({
				new_password: new_password.trim(),
				confirm_password: confirm_password.trim(),
				current_password: current_password.trim()
			}),

			headers: {
				'content-type': 'application/json'
			}
		})
			.then((response) => response.json())
			.then((result) => {
				if (result.success) {
					mode = 'saved';

					new_password = '';
					confirm_password = '';
					current_password = '';

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
</script>

<form>
	<label>
		New Password
		<br />
		<input type="password" bind:value={new_password} />
	</label>
	<br />
	<label>
		Confirm Password
		<br />
		<input type="password" bind:value={confirm_password} />
	</label>
	<br />
	<label>
		Current Password
		<br />
		<input type="password" bind:value={current_password} />
	</label>
	<br />
	<br />
	<button type="submit" onclick={saveChange}>Change</button>
	{#if mode === 'saving'}
		<p>Saving...</p>
	{:else if mode === 'saved'}
		<p>Saved...</p>
	{/if}
</form>

<ErrorDisplay bind:this={ErrorMessage} />
