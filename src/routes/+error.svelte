<script lang="ts">
	import { page } from '$app/state';
	import Button from '$components/shadcn/button/button.svelte';
	import { m } from '$paraglide/messages.js';

	import '../app.css';
</script>

<div class="center">
	<p class="text-2xl">{page.status}</p>
	<p>{page.error?.message}</p>

	<Button
		onclick={() => {
			history.back();
		}}
	>
		{m.goBack()}
	</Button>
</div>

<style>
	.center {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		gap: 1rem;
	}
</style>
