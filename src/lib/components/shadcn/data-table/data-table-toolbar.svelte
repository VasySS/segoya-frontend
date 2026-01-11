<script lang="ts">
	import { RotateCw } from '@lucide/svelte';
	import { Input } from '$components/shadcn/input';
	import ButtonLoading from '$components/shared/button-loading/button-loading.svelte';
	import { m } from '$paraglide/messages';

	interface Props {
		globalFilter: string;
		toolbarRefreshCallback: () => Promise<void>;
	}
	let { globalFilter = $bindable(), toolbarRefreshCallback }: Props = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-4 p-1">
	<!-- TODO - return when (if) filter is implemented on backend -->
	<!-- <Input
		bind:value={globalFilter}
		placeholder={m.knotty_nimble_wolf_trust()}
		class="w-56"
		disabled
	/> -->
	<div></div>

	<ButtonLoading funcWithLoading={toolbarRefreshCallback}>
		<RotateCw size={20}></RotateCw>
	</ButtonLoading>
</div>
