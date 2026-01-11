<!--
@component
An input field component, with ability to show or hide the sensitive data.
-->
<script lang="ts">
	import { EyeIcon, EyeOffIcon } from '@lucide/svelte';
	import { Button } from '$components/shadcn/button/index';
	import { Input } from '$components/shadcn/input/index';
	import { cn } from '$lib/utils/shadcn';
	import type { ControlAttrs } from 'formsnap';

	interface Props {
		id: string;
		inputValue: string;
		placeholder: string;
		className?: string;
		formProps?: ControlAttrs;
	}
	// eslint-disable-next-line @typescript-eslint/no-useless-default-assignment
	let { id, inputValue = $bindable(), placeholder, className, formProps }: Props = $props();

	let showInputValue = $state(false);
</script>

<div class={cn('relative', className)}>
	<Input
		{id}
		bind:value={inputValue}
		type={showInputValue ? 'text' : 'password'}
		autocapitalize="none"
		autocorrect="off"
		autocomplete="new-password"
		class="h-full pr-14"
		{placeholder}
		{...formProps}
	/>

	<Button
		variant="ghost"
		class="text-foreground bg-accent/30 absolute top-0 right-0 mr-1 h-full rounded-4xl px-3 py-2"
		onclick={() => (showInputValue = !showInputValue)}
	>
		{#if showInputValue}
			<EyeIcon />
		{:else}
			<EyeOffIcon />
		{/if}
	</Button>
</div>
