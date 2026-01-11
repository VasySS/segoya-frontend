<script lang="ts">
	import { cn } from '$lib/utils/shadcn';
	import { Tabs as TabsPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
	bind:ref
	data-slot="tabs-trigger"
	class={cn(
		'ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-foreground inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-base font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-xs',
		className
	)}
	{...restProps}
/>
