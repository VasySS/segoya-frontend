<script lang="ts">
	import * as Sidebar from '$components/shadcn/sidebar/index.js';
	import type { Snippet } from 'svelte';

	import SidebarApp from './AppSidebar.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<Sidebar.Provider>
	<SidebarApp></SidebarApp>

	<Sidebar.Trigger class="mt-4 ml-4" />

	<div class="my-24 -ml-11 flex w-screen flex-col items-center overflow-x-hidden">
		<main class="flex w-80 flex-col sm:w-4/5 md:w-2/3 xl:w-3/5 2xl:w-2/5">
			{@render children()}
		</main>
	</div>
</Sidebar.Provider>
