<!--
@component
An input field component, with ability to show or hide the sensitive data.
-->
<script lang="ts">
	import { EyeIcon, EyeOffIcon } from '@lucide/svelte';
	import { cn } from '#lib/utils/shadcn.js';
	import type { ControlAttrs } from 'formsnap';
	import { Button } from '#components/shadcn/button/index.js';
	import { Input } from '#components/shadcn/input/index.js';

	interface Props {
		id: string;
		inputValue: string;
		placeholder: string;
		className?: string;
		formProps?: ControlAttrs;
	}
	// eslint-disable-next-line @typescript-eslint/no-useless-default-assignment
	let { id, inputValue = $bindable(), placeholder, className, formProps }: Props = $props();

	let isInputValueVisible = $state(false);
</script>

<div class={cn('relative', className)}>
	<Input
		{id}
		bind:value={inputValue}
		type={isInputValueVisible ? 'text' : 'password'}
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
		onclick={() => (isInputValueVisible = !isInputValueVisible)}
	>
		{#if isInputValueVisible}
			<EyeIcon />
		{:else}
			<EyeOffIcon />
		{/if}
	</Button>
</div>
