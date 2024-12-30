<script>
	import { enhance } from '$app/forms';

	let tab = $state('login');

	let { form } = $props();
</script>

<button
	onclick={() => {
		tab = 'login';
	}}>Login</button
>
<button
	onclick={() => {
		tab = 'register';
	}}>Register</button
>
<br />
<a href="/login/forgot-password">Forgot Password</a>
<hr />

{#if tab === 'login'}
	<form method="post" action="?/login" use:enhance>
		<label>
			Username
			<input type="text" name="username" required />
		</label>
		<br />
		<label>
			Password
			<input type="password" name="password" required />
		</label>
		<br />
		<button>Login</button>
	</form>
{:else if tab === 'register'}
	<form method="post" action="?/register" use:enhance>
		<label>
			Username
			<input type="text" name="username" required />
		</label>
		<br />
		<label>
			Email
			<input type="email" name="email" required />
		</label>
		<br />
		<label>
			Password
			<input type="password" name="password" required />
		</label>
		<br />
		<button>Register</button>
	</form>
{/if}
<p style="color: red">{form?.message ?? ''}</p>
