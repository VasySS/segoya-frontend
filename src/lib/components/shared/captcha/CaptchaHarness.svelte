<script lang="ts">
	import Captcha from './Captcha.svelte';

	let token = $state('');
	let captcha = $state<Captcha>();
</script>

<Captcha
	bind:token
	bind:this={captcha}
/>
<output aria-label="captcha token">{token}</output>
<button
	type="button"
	onclick={() => {
		captcha?.reset();
	}}
	>Reset CAPTCHA
</button>
