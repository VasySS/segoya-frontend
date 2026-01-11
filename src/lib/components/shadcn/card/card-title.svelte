<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils/shadcn.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card-title"
	class={cn('text-2xl leading-none font-semibold tracking-tight', className)}
	{...restProps}
>
	{@render children?.()}
</div>
