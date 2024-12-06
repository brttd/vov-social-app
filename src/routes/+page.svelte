<script>
    let { data } = $props();
</script>

<h1>Users</h1>

{#each data.users as user}
    {#if user.email}
        <p>{user.name} <code>({user.email})</code></p>
    {:else}
        <p>{user.name}</p>
    {/if}
{/each}