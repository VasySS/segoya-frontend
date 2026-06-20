<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	// this route exists only to hard refresh the profile page from server side
	onMount(() => {
		location.assign(resolve('/(with-sidebar)/profile'));
	});
</script>
