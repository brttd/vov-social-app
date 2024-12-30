<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

{#if data.token}
	{#if data.validToken}
		{#if form?.success}
			<p>Password has been changed. You can now <a href="/login">login</a></p>
		{/if}
		<form method="post" action="?/reset" use:enhance>
			<input type="hidden" name="token" value={data.token} />
			<label>
				New Password
				<input type="password" name="password" required />
			</label>
			<br />
			<button>Set Password</button>
		</form>
		<p style="color: red">{form?.message ?? ''}</p>
	{:else}
		Reset Password Link no longer valid! ({data.token})
	{/if}
{:else}
	{#if form?.success}
		<p>Email sent...</p>
	{/if}
	<form method="post" action="?/forgot" use:enhance>
		<label>
			Username or Email Address
			<input type="text" name="username" required />
		</label>
		<br />
		<button>Reset Password</button>
	</form>
	<p style="color: red">{form?.message ?? ''}</p>
{/if}
