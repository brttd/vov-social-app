<script>
	import UsernameForm from './UsernameForm.svelte';
	import EmailForm from './EmailForm.svelte';
	import PasswordForm from './PasswordForm.svelte';

	let changePassword = $state(false);

	let { data, form } = $props();
</script>

<h1>Account ({data.user.username})</h1>

<h2>Username</h2>
<UsernameForm></UsernameForm>
<h2>Email</h2>
<EmailForm></EmailForm>
<h2>Password</h2>
<PasswordForm></PasswordForm>
