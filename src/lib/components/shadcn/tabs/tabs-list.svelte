<script lang="ts">
	import { cn } from '$lib/utils/shadcn';
	import { Tabs as TabsPrimitive } from 'bits-ui';

	let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	data-slot="tabs-list"
	class={cn(
		'bg-secondary text-muted-foreground inline-flex h-10 items-center justify-center rounded-sm pr-0.5 pl-0.5',
		className
	)}
	{...restProps}
/>
