<script lang="ts">
	import type { PlayAreaSelection, Provider } from '#lib/api/openapi.js';
	import { AreaCounter } from '#lib/play-areas/count.svelte.js';
	import { selectionKey } from '#lib/play-areas/geometry.js';
	import { m } from '#paraglide/messages.js';
	import { getLocale } from '#paraglide/runtime.js';
	import Button from '#components/shadcn/button/button.svelte';

	let {
		jwt,
		provider,
		selection,
		rounds = 1,
		eligible = $bindable(false),
		valid = $bindable(false),
		revision = 0,
		incomplete = false
	}: {
		jwt: string;
		provider: Provider;
		selection: PlayAreaSelection;
		rounds?: number;
		eligible?: boolean;
		valid?: boolean;
		revision?: number;
		incomplete?: boolean;
	} = $props();

	const counter = new AreaCounter();
	let retry = $state(0);
	const currentKey = $derived(selectionKey(provider, selection));

	$effect(() => {
		// These refresh fields intentionally participate in effect tracking.
		const request = { jwt, provider, selection: $state.snapshot(selection), retry, revision };
		counter.schedule(request.jwt, request.provider, request.selection);
		return () => {
			counter.cancel();
		};
	});

	const isCurrent = $derived(counter.key === currentKey && !incomplete);
	const canStart = $derived(
		isCurrent &&
			counter.status === 'ready' &&
			counter.count !== undefined &&
			counter.count >= rounds
	);

	const isValid = $derived(isCurrent && counter.status === 'ready');
	$effect(() => {
		if (valid !== isValid) valid = isValid;
		if (eligible !== canStart) eligible = canStart;
	});
</script>

<div
	data-testid="area-count"
	class="space-y-2 rounded-md border p-3 text-sm"
	aria-live="polite"
	aria-atomic="true"
>
	{#if incomplete || counter.status === 'invalid'}
		<p>{counter.error || m.areaCompleteSelection()}</p>
	{:else if !isCurrent || counter.status === 'checking' || counter.status === 'idle'}
		<p class="text-muted-foreground">{m.areaChecking()}</p>
	{:else if counter.status === 'failed'}
		<p class="text-destructive">{m.areaRequestFailed()}</p>
		<p>{counter.error}</p>

		<Button
			type="button"
			variant="outline"
			onclick={() => retry++}
		>
			{m.areaRetry()}
		</Button>
	{:else if counter.count !== undefined}
		<p>
			{m.areaCount({
				count: new Intl.NumberFormat(getLocale()).format(counter.count),
				rounds: String(rounds)
			})}
		</p>

		{#if counter.count < rounds}
			<p class="text-destructive">
				{m.areaInsufficient()}
			</p>
		{/if}

		<Button
			type="button"
			size="sm"
			variant="ghost"
			onclick={() => retry++}
		>
			{m.areaRefreshCount()}
		</Button>
	{/if}
</div>
