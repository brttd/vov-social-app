<script>
	import '../app.css';

	import { enhance } from '$app/forms';

	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';

	let { data, children } = $props();

	let formattedName = $derived(
		data.user.username.substr(0, 1).toUpperCase() + data.user.username.substr(1)
	);

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
		<a href="/profile" class:active={page.url.pathname === '/profile'}>Profile</a>
		<a
			href="/users/{data.user.username}"
			class:active={page.url.pathname === '/users/' + data.user.username}>{formattedName}</a
		>
		{#if data.notifications && data.notifications.length > 0}
			<a
				class="notifications"
				class:active={page.url.pathname === '/notifications'}
				href="/notifications">({data.notifications.length} notifications)</a
			>
		{/if}
		<div class="seperator"></div>
		<form method="post" action="/?/logout" use:enhance>
			<button>Sign Out</button>
		</form>
	{:else}
		<a href="/login">Login</a>
	{/if}
</nav>

{@render children()}

<style>
	* {
		font-family: sans-serif;
		font-size: 1rem;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		padding: 0.5rem 0;
		background-color: #242031;
	}

	a {
		border: none;
		text-decoration: none;
		color: white;
	}

	button {
		border: none;
		text-decoration: none;
		background-color: transparent;
		color: white;
		appearance: none;
		cursor: pointer;
		padding: 0;
	}

	nav a,
	nav button {
		color: white;
		margin: 0 1rem;
		padding: 5px 0;

		border-top: solid transparent 2px;
		border-bottom: solid transparent 2px;
	}
	nav a:hover,
	nav button:hover {
		border-top: solid #504b61 2px;
		border-bottom: solid #504b61 2px;

		position: relative;
		top: 2px;
	}
	.active {
		border-top: solid #504b61 2px;
		border-bottom: solid #504b61 2px;
	}

	@media (max-width: 600px) {
		nav {
			justify-content: space-evenly;
		}
		nav a,
		nav button {
			margin: 0 0.5rem;
		}
	}

	form {
		display: contents;
	}

	.seperator {
		width: 2px;
		background-color: #504b61;
	}
</style>
