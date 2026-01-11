<!-- a component based on the original button component from shadcn, but showing a loading spinner 
	while attached function is being executed -->
<script
	lang="ts"
	module
>
	import type { WithElementRef } from '$lib/utils/shadcn';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { tv, type VariantProps } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: 'active:scale-95 ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-base font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none',
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-accent/90',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline: 'border-input bg-background hover:bg-accent hover:text-accent-foreground border',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary-foreground underline-offset-4 hover:underline'
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-sm px-3',
				lg: 'h-11 rounded-sm px-8',
				icon: 'size-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';
	import { cn } from '$lib/utils/shadcn';
	import { readable, type Readable } from 'svelte/store';

	///// only part that differs from regular button from shadcn:
	interface LoadingProps {
		funcWithLoading?: () => Promise<void>;
		delayed?: Readable<boolean>;
	}

	let isLoading = $state(false);

	async function runFuncWithLoading() {
		isLoading = true;

		try {
			await funcWithLoading?.();
		} finally {
			isLoading = false;
		}
	}
	/////

	let {
		funcWithLoading,
		delayed = readable(false),
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(),
		href,
		type = 'button',
		disabled,
		children,
		...restProps
	}: ButtonProps & LoadingProps = $props();
</script>

{#if isLoading || $delayed}
	<button
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), className)}
		disabled={isLoading || $delayed}
		{...restProps}
	>
		<LoaderCircle class="animate-spin" />
	</button>
{:else if href}
	<a
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), className)}
		onclick={funcWithLoading ? runFuncWithLoading : restProps.onclick}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		onclick={funcWithLoading ? runFuncWithLoading : restProps.onclick}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
