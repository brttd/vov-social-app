<script>
	let error = $state('');

	let timeout = null;

	export function hideError() {
		error = '';
	}

	export function showError(message, time = 10) {
		if (timeout) {
			clearTimeout(timeout);
		}

		error = message;

		timeout = setTimeout(hideError, 1000 * time);
	}
</script>

{#if error}
	<p style="color:red">{error}</p>
{/if}
