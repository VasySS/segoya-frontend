<script lang="ts">
	import * as Avatar from '$components/shadcn/avatar/index';
	import * as Card from '$components/shadcn/card/index';
	import type { UserPublicProfile } from '$lib/api/openapi.js';
	import { getAvatarSource } from '$lib/utils/helpers';
	import { m } from '$paraglide/messages.js';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	const user = data.user as UserPublicProfile;
</script>

<svelte:head>
	<title>Segoya &mdash; {m.profileHeader()} {user.username}</title>
</svelte:head>

<h1 class="mb-12 text-center">{m.profileHeader()} {user.username}</h1>

<Card.Root>
	<Card.Header>
		<Card.Title></Card.Title>
	</Card.Header>

	<Card.Content class="flex flex-row flex-wrap gap-6">
		<Avatar.Root class="size-44">
			<Avatar.Image
				src={getAvatarSource(user.avatarHash, user.username)}
				loading="lazy"
				alt="avatar"
			/>
		</Avatar.Root>

		<div>
			<p>{m.extra_odd_dolphin_talk()}: {user.name}</p>
			<p>{m.lost_pink_yak_gasp()}: {new Date(user.registerDate).toLocaleDateString()}</p>
		</div>
	</Card.Content>
</Card.Root>
