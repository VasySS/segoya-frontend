<script lang="ts">
	import { Separator } from '$lib/components/shadcn/separator/index.js';
	import { cn } from '$lib/utils/shadcn.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		orientation = 'vertical',
		...restProps
	}: ComponentProps<typeof Separator> = $props();
</script>

<Separator
	bind:ref
	data-slot="button-group-separator"
	{orientation}
	class={cn('relative m-0! self-stretch bg-red-600 data-[orientation=vertical]:h-0.5', className)}
	{...restProps}
/>
