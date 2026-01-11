<script lang="ts">
	import { asset } from '$app/paths';
	import Button from '$components/shadcn/button/button.svelte';
	import { DISCORD_OAUTH_LOGIN_URL } from '$lib/api/auth';
	import { m } from '$paraglide/messages.js';

	function onclick() {
		globalThis.location.href = DISCORD_OAUTH_LOGIN_URL;
	}
</script>

<Button
	class="w-full space-x-1"
	{onclick}
>
	<img
		src={asset('/logos/discord-logo.svg')}
		class="size-7"
		alt="discord logo"
	/>
	<p>{m.plane_neat_thrush_dart()} Discord</p>
</Button>
