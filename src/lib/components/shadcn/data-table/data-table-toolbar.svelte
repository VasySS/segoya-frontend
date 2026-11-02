<script lang="ts">
	import { RotateCw } from '@lucide/svelte';
	import ButtonLoading from '#components/shared/button-loading/button-loading.svelte';

	interface Props {
		toolbarRefreshCallback: () => Promise<void>;
	}
	let { toolbarRefreshCallback }: Props = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-4 p-1">
	<div></div>

	<ButtonLoading funcWithLoading={toolbarRefreshCallback}>
		<RotateCw size={20}></RotateCw>
	</ButtonLoading>
</div>
