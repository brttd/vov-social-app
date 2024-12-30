<script>
	import { enhance } from '$app/forms';

	let { data, children } = $props();
</script>

<nav>
	{#if data.user}
		<a href="/">Home</a>
		<a href="/profile">Profile</a>
		<form method="post" action="/?/logout" use:enhance>
			<button>Sign out</button>
		</form>
	{:else}
		<a href="/login">Login</a>
	{/if}
</nav>

{@render children()}

<style>
	nav {
		border-bottom: 2px solid black;
		margin-bottom: 30px;
	}
	nav form {
		display: inline-block;
	}
</style>
