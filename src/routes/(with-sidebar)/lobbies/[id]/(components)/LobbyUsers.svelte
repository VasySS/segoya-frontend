<script lang="ts">
	import { Crown } from '@lucide/svelte';
	import * as Avatar from '$components/shadcn/avatar/index';
	import { ScrollArea } from '$components/shadcn/scroll-area/index';
	import { Separator } from '$components/shadcn/separator/index';
	import * as Tooltip from '$components/shadcn/tooltip/index';
	import UserHoverCard from '$components/shared/UserHoverCard.svelte';
	import type { Lobby, UserPublicProfile } from '$lib/api/openapi';
	import { getAvatarSource } from '$lib/utils/helpers';
	import { m } from '$paraglide/messages.js';
	import { fly } from 'svelte/transition';

	interface Props {
		lobbyInfo: Lobby;
	}
	let { lobbyInfo }: Props = $props();

	let users = $state<UserPublicProfile[]>([]);
	let usersCount = $derived(users.length);

	export const getUsersCount = () => {
		return usersCount;
	};

	export const addUser = (user: UserPublicProfile) => {
		users = [...users, user];
	};

	export const deleteUser = (username: string) => {
		users = users.filter((p) => p.username !== username);
	};

	export const updateUsers = (newUsers: UserPublicProfile[]) => {
		users = newUsers;
	};
</script>

<ScrollArea class="h-40 flex-1 space-y-4 pb-6 md:border-r md:border-b-0 md:pr-6 md:pb-0">
	<div class="space-y-2">
		{#each users as player (player.username)}
			<div
				class="flex items-center gap-3"
				in:fly={{ x: -50, duration: 500 }}
				out:fly={{ x: -50, duration: 500 }}
			>
				<Avatar.Root class="size-8">
					<Avatar.Image
						src={getAvatarSource(player.avatarHash, player.username)}
						class="rounded-full"
						alt="avatar"
						loading="lazy"
					/>
				</Avatar.Root>

				<UserHoverCard user={player}></UserHoverCard>

				{#if player.id === lobbyInfo.creatorID}
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger class="text-yellow-500">
								<Crown class="h-4 w-4" />
							</Tooltip.Trigger>

							<Tooltip.Content>
								<p>{m.lobbyCreator()}</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				{/if}
			</div>

			<Separator></Separator>
		{/each}
	</div>
</ScrollArea>
