<script>
	import { MediaQuery } from 'svelte/reactivity';

	import { page } from '$app/state';
	import { onMount } from 'svelte';

	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { invalidate } from '$app/navigation';

	let { post_id, reaction = $bindable(null), reactions = $bindable([]) } = $props();

	const touch = new MediaQuery('hover: none');

	let hovering = $state(false);

	let allReactions = $derived.by(() => {
		const list = [];

		for (let i = 0; i < page.data.reactions.length; i++) {
			const active = reaction == page.data.reactions[i].id;

			let count = active ? 1 : 0;

			for (let j = reactions.length - 1; j >= 0; j--) {
				if (reactions[j].reaction === page.data.reactions[i].id) {
					count += 1;
				}
			}

			list.push({
				count: count,
				active: active,
				id: page.data.reactions[i].id,
				text: page.data.reactions[i].text,
				default: page.data.reactions[i].text === '❤️'
			});
		}

		return list;
	});
	let displayedReactions = $derived(
		allReactions.filter((item) => touch.current || hovering || item.count > 0 || item.default)
	);

	function getReactDisplay(id) {
		for (let i = 0; i < page.data.reactions.length; i++) {
			if (page.data.reactions[i].id === id) {
				return page.data.reactions[i].text;
			}
		}

		return '(?)';
	}

	let mode = $state('');

	let errorMessage = $state('');
	let errorMessageTimeout = null;

	function showError(message) {
		if (errorMessageTimeout) {
			clearTimeout(errorMessageTimeout);
		}

		errorMessage = message;

		errorMessageTimeout = setTimeout(() => {
			errorMessage = '';
		}, 1000 * 5);
	}

	function react(id) {
		fetch(`/api/posts/${post_id}/react`, {
			method: 'POST',

			body: JSON.stringify({
				reaction: reaction == id ? null : id
			}),

			headers: {
				'content-type': 'application/json'
			}
		})
			.then((response) => response.json())
			.then((result) => {
				if (result.success) {
					reaction = result.data.reaction;

					// And then invalidate the data for the post
					invalidate('app:post:' + post_id);
				} else {
					throw new Error(result.message);
				}
			})
			.catch((error) => {
				mode = '';
				console.error(error);
				showError('An error occurred! (' + error.message + ')');
			});
	}
</script>

<div
	style="display: inline-block"
	onpointerover={() => {
		hovering = true;
	}}
	onpointerleave={() => {
		hovering = false;
	}}
>
	{#if reactions.length > 0}
		<details>
			<summary>
				Like
				{#each displayedReactions as reactionOption (reactionOption.id)}
					<button
						animate:flip
						transition:fade
						class:active={reactionOption.active}
						onclick={() => {
							react(reactionOption.id);
						}}
					>
						{reactionOption.text}
						{#if reactionOption.count > 0}
							x{reactionOption.count}
						{/if}
					</button>
				{/each}
			</summary>
			{#if page.data.user && reaction}
				<p>
					<a href="/users/{page.data.user.username}">{page.data.user.username}</a> (You) {getReactDisplay(
						reaction
					)}
				</p>
			{/if}
			{#each reactions as reaction}
				<p>
					<a href="/users/{reaction.user.username}">{reaction.user.username}</a>
					{getReactDisplay(reaction.reaction)}
				</p>
			{/each}
		</details>
	{:else}
		Like
		{#each displayedReactions as reactionOption (reactionOption.id)}
			<button
				animate:flip
				transition:fade
				class:active={reactionOption.active}
				onclick={() => {
					react(reactionOption.id);
				}}
			>
				{reactionOption.text}
				{#if reactionOption.count > 0}
					x{reactionOption.count}
				{/if}
			</button>
		{/each}
	{/if}
</div>

{#if errorMessage}
	<br />
	<p class="error">{errorMessage}</p>
{/if}

<style>
	.error {
		color: red;
	}
	button.active {
		background-color: lightgreen;
	}
	div {
		vertical-align: top;
	}
</style>
