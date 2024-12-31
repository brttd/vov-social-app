<script>
	import '../app.css';

	import { enhance } from '$app/forms';

	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';

	let { data, children } = $props();

	onMount(() => {
		// Every minute and a half, check for new notifications
		const timer = setInterval(() => {
			if (document.hasFocus()) {
				invalidate('app:notifications');
			}
		}, 1000 * 90);

		return () => {
			clearInterval(timer);
		};
	});
</script>

<nav>
	{#if data.user}
		<a href="/" class:active={page.url.pathname === '/'}>Home</a>
		<a href="/users" class:active={page.url.pathname === '/users'}>Users</a>
		<a href="/profile" class:active={page.url.pathname === '/profile'}>Edit Profile</a>
		<form method="post" action="/?/logout" use:enhance>
			<button>Sign out</button>
		</form>
		<a
			href="/users/{data.user.username}"
			class:active={page.url.pathname === '/users/' + data.user.username}>{data.user.username}</a
		>
		{#if data.notifications && data.notifications.length > 0}
			(<a href="/notifications">{data.notifications.length} notifications</a>)
		{/if}
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
	nav a.active {
		opacity: 0.5;
	}
	nav form {
		display: inline-block;
	}
</style>
