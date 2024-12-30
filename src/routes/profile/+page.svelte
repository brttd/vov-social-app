<script>
	import { enhance } from '$app/forms';

	let changePassword = $state(false);

	let { data, form } = $props();
</script>

<h1>Profile ({data.user.username})</h1>
<form method="post" action="?/update" use:enhance>
	<label>
		Email
		<input type="email" name="email" required value={data.user.email} />
	</label>

	<br />

	<label>
		<input type="checkbox" name="change_password" bind:checked={changePassword} value="yes" />
		Change Password
	</label>
	<br />

	{#if changePassword}
		<label>
			New Password
			<input type="password" name="new_password" required />
		</label>
		<br />
		<label>
			Confirm New Password
			<input type="password" name="confirm_password" required />
		</label>
		<br />
		<label>
			Current Password
			<input type="password" name="current_password" required />
		</label>
		<br />
	{/if}

	<button>Update</button>
</form>
<p style="color: red">{form?.message ?? ''}</p>
