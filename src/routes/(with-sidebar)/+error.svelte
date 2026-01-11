<script lang="ts">
	import { page } from '$app/state';
	import Button from '$components/shadcn/button/button.svelte';
	import { m } from '$paraglide/messages.js';
</script>

<h1 class="mb-12 text-center">{m.error()} {page.status}</h1>

<p class="self-center text-xl">{page.error?.message}</p>
<Button
	onclick={() => {
		history.back();
	}}
	class="mt-5 w-60 self-center"
>
	{m.goBack()}
</Button>
