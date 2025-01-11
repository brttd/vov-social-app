<script>
	import { enhance } from '$app/forms';

	let tab = $state('login');

	let { form } = $props();
</script>

<div class="column">
	<div class="main">
		<div class="buttons">
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
		</div>

		{#if tab === 'login'}
			<form method="post" action="?/login" use:enhance>
				<label>
					Username
					<br />
					<input type="text" name="username" required />
				</label>
				<br />
				<label>
					Password
					<br />
					<input type="password" name="password" required />
				</label>
				<br />
				<button>Login</button>
			</form>
		{:else if tab === 'register'}
			<form method="post" action="?/register" use:enhance>
				<label>
					Username
					<br />
					<input type="text" name="username" required />
				</label>
				<br />
				<label>
					Email
					<br />
					<input type="email" name="email" required />
				</label>
				<br />
				<label>
					Password
					<br />
					<input type="password" name="password" required />
				</label>
				<br />
				<button>Register</button>
			</form>
		{/if}
		<p style="color: red">{form?.message ?? ''}</p>

		<a href="/login/forgot-password">Forgot Password</a>
	</div>
</div>

<style>
	.column {
		display: flex;
		flex-flow: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
	}
	.buttons {
		text-align: center;
		margin-bottom: 10px;
	}
</style>
