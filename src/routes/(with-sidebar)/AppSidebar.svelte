<script lang="ts">
	import {
		ChevronsUpDownIcon,
		CircleUserRoundIcon,
		HouseIcon,
		PlayIcon,
		SettingsIcon,
		SunIcon,
		UsersIcon
	} from '@lucide/svelte';
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import Settings from '$components/game/Settings.svelte';
	import * as DropdownMenu from '$components/shadcn/dropdown-menu/index';
	import * as Sidebar from '$components/shadcn/sidebar/index.js';
	import { useSidebar } from '$components/shadcn/sidebar/index.js';
	import type { JwtPayload } from '$lib/types/auth';
	import { m } from '$paraglide/messages';
	import { getLocale, setLocale } from '$paraglide/runtime';
	import { toggleMode } from 'mode-watcher';

	let settingsOpen = $state(false);

	const jwtPayload = $derived(() => page.data.jwtPayload as JwtPayload | undefined);
	const sidebar = useSidebar();
</script>

<Settings bind:settingsOpen />

<Sidebar.Root collapsible="icon">
	<Sidebar.Header class="bg-primary pl-1.5">
		<Sidebar.Menu>
			<Sidebar.Group class="flex flex-row items-center justify-between">
				<Sidebar.MenuButton
					size="lg"
					class="h-10"
				>
					{#snippet child({ props })}
						<a
							href={resolve('/(with-sidebar)/home')}
							{...props}
						>
							<HouseIcon />
							<p class="text-2xl">Segoya</p></a
						>
					{/snippet}
				</Sidebar.MenuButton>

				<div class="grow"></div>

				<Sidebar.MenuButton
					class="mr-3 w-12 items-center justify-center group-data-[collapsible=icon]:hidden"
					onclick={toggleMode}
				>
					<SunIcon size={26} />
				</Sidebar.MenuButton>

				<Sidebar.MenuButton
					class="w-14 items-center justify-center p-1.5 group-data-[collapsible=icon]:hidden"
					size="sm"
					title={m.changeLanguage()}
					onclick={async () => {
						await setLocale(getLocale() === 'en' ? 'ru' : 'en');
					}}
					data-sveltekit-reload
				>
					{#if getLocale() == 'en'}
						<img
							src={asset('/icons/en-flag.svg')}
							alt="ru"
							class="size-6"
						/>
					{:else if getLocale() == 'ru'}
						<img
							src={asset('/icons/ru-flag.svg')}
							alt="en"
							class="size-5"
						/>
					{/if}
				</Sidebar.MenuButton>
			</Sidebar.Group>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content class="mt-4 pl-1.5">
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu class="space-y-4">
					<!-- Singleplayer -->
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							size="lg"
							class="h-10"
						>
							{#snippet child({ props })}
								<a
									href={resolve('/(with-sidebar)/quick-game')}
									{...props}
								>
									<PlayIcon />
									<p class="text-xl">{m.sidebarSingleplayer()}</p>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>

					<!-- Multiplayer -->
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							size="lg"
							class="h-10"
						>
							{#snippet child({ props })}
								<a
									href={resolve('/(with-sidebar)/lobbies')}
									{...props}
								>
									<UsersIcon />
									<p class="text-xl">{m.sidebarMultiplayer()}</p>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="pb-3 pl-3.5">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="w-full rounded-sm"
						id="navbar-dropdown"
						title={m.openMenu()}
					>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								size="lg"
								{...props}
								class="flex h-10 flex-row items-center space-x-1"
							>
								<CircleUserRoundIcon />

								{#if jwtPayload()}
									<p class="text-base font-bold group-data-[collapsible=icon]:hidden">
										{jwtPayload()?.username}
									</p>
								{/if}

								<div class="grow group-data-[collapsible=icon]:hidden"></div>

								<ChevronsUpDownIcon class="group-data-[collapsible=icon]:hidden" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>

					<DropdownMenu.Content side={sidebar.isMobile ? 'bottom' : 'right'}>
						<a href={resolve('/(with-sidebar)/profile')}>
							<DropdownMenu.Item class="flex cursor-pointer flex-row items-center space-x-3">
								<CircleUserRoundIcon />
								<p>{m.floatingProfile()}</p>
							</DropdownMenu.Item>
						</a>

						<DropdownMenu.Item
							onclick={() => (settingsOpen = !settingsOpen)}
							class="flex cursor-pointer flex-row items-center space-x-3"
						>
							<SettingsIcon />
							<p>{m.singleSettings()}</p>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
