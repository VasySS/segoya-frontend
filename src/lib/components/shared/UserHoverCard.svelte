<script lang="ts">
	import { Calendar } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import * as HoverCard from '$components/shadcn/hover-card/index.js';
	import type { UserPublicProfile } from '$lib/api/openapi';
	import { formatDate } from '$lib/utils/temporal';
	import { m } from '$paraglide/messages.js';

	interface Props {
		user: UserPublicProfile;
	}
	let { user }: Props = $props();
</script>

<HoverCard.Root>
	<HoverCard.Trigger
		class="underline-offset-4 hover:underline"
		href={resolve('/(with-sidebar)/profile/[id]', {
			id: user.id
		})}
		target="_blank"
	>
		{user.username}
	</HoverCard.Trigger>

	<HoverCard.Content class="w-52 space-y-2">
		<p>{m.extra_odd_dolphin_talk()}: {user.name}</p>
		<div class="flex items-center space-x-2">
			<Calendar></Calendar>
			<p>
				{formatDate(user.registerDate)}
			</p>
		</div>
	</HoverCard.Content>
</HoverCard.Root>
