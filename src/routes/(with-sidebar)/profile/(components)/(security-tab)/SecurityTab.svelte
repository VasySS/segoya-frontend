<script lang="ts">
	import { CircleSmallIcon, Save, Trash, Trash2 } from '@lucide/svelte';
	import * as Accordion from '$components/shadcn/accordion/index';
	import { Button } from '$components/shadcn/button/index';
	import * as Card from '$components/shadcn/card/index';
	import { Label } from '$components/shadcn/label/index';
	import * as Tooltip from '$components/shadcn/tooltip/index';
	import ButtonLoading from '$components/shared/button-loading/button-loading.svelte';
	import HiddenInput from '$components/shared/HiddenInput.svelte';
	import { fetchBackend } from '$lib/api/base';
	import type { AuthProvider, UserSession } from '$lib/api/openapi';
	import { APIKeys } from '$lib/constants/enums';
	import type { JwtPayload } from '$lib/types/auth';
	import type { UserAPIKeys } from '$lib/types/user';
	import { formatDateTime } from '$lib/utils/temporal';
	import { m } from '$paraglide/messages.js';
	import type { CookieOptions } from '$routes/api/cookies/[name]/+server';
	import Bowser from 'bowser';
	import { toast } from 'svelte-sonner';

	import DiscordProfileButton from './DiscordButton.svelte';
	import YandexProfileButton from './YandexButton.svelte';

	interface Props {
		sessions: UserSession[];
		connectedOAuth: AuthProvider[];
		jwtToken: string;
		jwtPayload: JwtPayload;
		apiKeys: UserAPIKeys;
	}
	let { sessions, connectedOAuth, jwtToken, jwtPayload, apiKeys }: Props = $props();

	// svelte-ignore state_referenced_locally
	let yandexKey = $state(apiKeys.yandex);
	// svelte-ignore state_referenced_locally
	let googleKey = $state(apiKeys.google);
	// svelte-ignore state_referenced_locally
	let seznamKey = $state(apiKeys.seznam);

	const cookieSettings = {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 34_560_000 //400 days is max age
	} as CookieOptions;

	async function handleAddYandexKey() {
		if (!yandexKey) return;

		const yandexTestURL = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexKey}&geocode=Irkutsk%2C+City&format=json`;

		await fetch(yandexTestURL)
			.then(
				(response) =>
					response.json() as Promise<{
						statusCode: number;
						error: string;
						message: string;
					}>
			)
			.then(async (data) => {
				if (data.statusCode < 200 || data.statusCode > 299) {
					toast.error(m.heroic_plain_reindeer_tickle(), {
						description: data.message
					});
				} else {
					await fetch(`/api/cookies/${APIKeys.YANDEX}`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							value: yandexKey,
							options: cookieSettings
						})
					});

					toast.success(m.sea_smug_crow_nudge());
				}
			})
			.catch((error: unknown) => {
				const err = error as Error;

				toast.error(m.heroic_plain_reindeer_tickle(), {
					description: err.message
				});
			});
	}

	async function handleDeleteYandexKey() {
		await fetch(`/api/cookies/${APIKeys.YANDEX}`, {
			method: 'DELETE'
		})
			.then(() => {
				yandexKey = '';
				toast.success(m.maroon_zippy_vulture_nourish());
			})
			.catch(() => {
				toast.error(m.silly_super_meerkat_favor());
			});
	}

	async function handleAddGoogleKey() {
		if (!googleKey) return;

		const googleTestURL = `https://maps.googleapis.com/maps/api/geocode/json?address=Paris&key=${googleKey}`;

		await fetch(googleTestURL)
			.then(
				(response) =>
					response.json() as Promise<{
						status: string;
						error_message?: string;
					}>
			)
			.then(async (data) => {
				if (data.status === 'OK') {
					await fetch(`/api/cookies/${APIKeys.GOOGLE}`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							value: googleKey,
							options: cookieSettings
						})
					});

					toast.success(m.sea_smug_crow_nudge());
				} else {
					toast.error(m.heroic_plain_reindeer_tickle(), {
						description: data.error_message ?? m.calm_tiny_oryx_launch()
					});
				}
			})
			.catch((error: unknown) => {
				const err = error as Error;

				toast.error(m.heroic_plain_reindeer_tickle(), {
					description: err.message
				});
			});
	}

	async function handleDeleteGoogleKey() {
		await fetch(`/api/cookies/${APIKeys.GOOGLE}`, {
			method: 'DELETE'
		})
			.then(() => {
				googleKey = '';
				toast.success(m.maroon_zippy_vulture_nourish());
			})
			.catch(() => {
				toast.error(m.silly_super_meerkat_favor());
			});
	}

	async function handleAddSeznamKey() {
		if (!seznamKey) return;

		const seznamTestURL = `https://api.mapy.cz/v1/geocode?query=Praha&apikey=${seznamKey}`;

		await fetch(seznamTestURL)
			.then(
				(response) =>
					response.json() as Promise<{
						detail?: { msg: string }[];
					}>
			)
			.then(async (data) => {
				if (data.detail?.[0]) {
					toast.error(m.heroic_plain_reindeer_tickle(), {
						description: data.detail[0].msg || 'Seznam API Key is invalid or has issues.'
					});
				} else {
					await fetch(`/api/cookies/${APIKeys.SEZNAM}`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							value: seznamKey,
							options: cookieSettings
						})
					});

					toast.success(m.sea_smug_crow_nudge());
				}
			})
			.catch((error: unknown) => {
				const err = error as Error;

				toast.error(m.heroic_plain_reindeer_tickle(), {
					description: err.message
				});
			});
	}

	async function handleDeleteSeznamKey() {
		await fetch(`/api/cookies/${APIKeys.SEZNAM}`, {
			method: 'DELETE'
		})
			.then(() => {
				seznamKey = '';
				toast.success(m.maroon_zippy_vulture_nourish());
			})
			.catch(() => {
				toast.error(m.silly_super_meerkat_favor());
			});
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>
			{m.such_every_lion_adapt()}
		</Card.Title>
	</Card.Header>

	<Card.Content class="flex flex-row flex-wrap gap-8">
		<Accordion.Root
			type="multiple"
			class="w-full"
		>
			<div class="space-y-6">
				<!-- Sessions Collapsible -->
				<Accordion.Item>
					<Accordion.Trigger>
						<h3 class="">{m.dry_smart_spider_zap()}</h3>
					</Accordion.Trigger>

					<Accordion.Content>
						<div class="bg-secondary mt-2 space-y-3 rounded-sm p-4">
							<p class="text-sm">{m.calm_next_stork_scoop()}</p>

							{#each sessions as session (session.sessionID)}
								{@const bowserParser = Bowser.getParser(session.ua)}

								<div class="rounded-sm border-2 p-3">
									<div class="flex items-center">
										<div class="w-10">
											{#if session.sessionID === jwtPayload.sessionID}
												<Tooltip.Provider>
													<Tooltip.Root>
														<Tooltip.Trigger data-testid="current-session-tooltip">
															<CircleSmallIcon
																class=" text-green-500"
																size={32}
															></CircleSmallIcon>
														</Tooltip.Trigger>

														<Tooltip.Content>
															{m.curly_maroon_elk_fade()}
														</Tooltip.Content>
													</Tooltip.Root>
												</Tooltip.Provider>
											{:else}
												<ButtonLoading
													title={m.super_each_bison_find()}
													size="sm"
													funcWithLoading={async () => {
														const response = await fetchBackend(
															jwtToken,
															'delete',
															`/v1/auth/sessions/{id}`,
															{
																path: { id: session.sessionID }
															}
														);

														if (!response.success) {
															toast.error(m.round_arable_stingray_prosper(), {
																description: response.error.detail
															});
															return;
														}

														sessions = sessions.filter((x) => x.sessionID !== session.sessionID);
														toast.success(m.tame_grassy_millipede_express());
													}}
												>
													<Trash2 size={20}></Trash2>
												</ButtonLoading>
											{/if}
										</div>

										<div class="ml-10">
											<p class="text-sm font-bold md:text-base">
												{bowserParser.getBrowserName()}
												{bowserParser.getBrowserVersion()}, {bowserParser.getOSName()}
												{bowserParser.getOS().version}
											</p>
											<p>{formatDateTime(session.lastActive)}</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</Accordion.Content>
				</Accordion.Item>

				<!-- OAuth Collapsible -->
				<Accordion.Item>
					<Accordion.Trigger>
						<h3 class="">OAuth</h3>
					</Accordion.Trigger>

					<Accordion.Content>
						<div class="bg-secondary mt-2 flex flex-col space-y-4 rounded-sm p-4">
							<YandexProfileButton
								oauthCreatedAt={connectedOAuth.find((x) => x.provider === 'yandex')?.createdAt}
								{jwtToken}
							/>

							<DiscordProfileButton
								oauthCreatedAt={connectedOAuth.find((x) => x.provider === 'discord')?.createdAt}
								{jwtToken}
							/>
						</div>
					</Accordion.Content>
				</Accordion.Item>

				<!-- API Collapsible -->
				<Accordion.Item>
					<Accordion.Trigger>
						<h3 class="">API</h3>
					</Accordion.Trigger>

					<Accordion.Content>
						<div class="bg-secondary mt-2 space-y-4 rounded-sm p-4">
							<p>
								{m.hour_curly_thrush_dream()}
							</p>

							<Label for="yandex-api">Yandex API</Label>

							<div>
								<div class="flex flex-row space-x-2">
									<HiddenInput
										bind:inputValue={yandexKey}
										id="yandex-api"
										className="w-full max-w-96"
										placeholder="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
									/>

									<ButtonLoading
										title={m.ago_grassy_warbler_lead()}
										class="hover:bg-green-700"
										funcWithLoading={handleAddYandexKey}
									>
										<Save size={20}></Save>
									</ButtonLoading>

									{#if yandexKey}
										<Button onclick={handleDeleteYandexKey}>
											<Trash size={20}></Trash>
										</Button>
									{/if}
								</div>
							</div>

							<Label for="google-api">Google API</Label>

							<div class="flex flex-row space-x-2">
								<HiddenInput
									bind:inputValue={googleKey}
									id="google-api"
									className="w-full max-w-96"
									placeholder="AIza..."
								/>

								<ButtonLoading
									title={m.raw_funny_bee_grin()}
									class="hover:bg-green-700"
									funcWithLoading={handleAddGoogleKey}
								>
									<Save size={20}></Save>
								</ButtonLoading>

								{#if googleKey}
									<Button onclick={handleDeleteGoogleKey}>
										<Trash size={20}></Trash>
									</Button>
								{/if}
							</div>

							<Label for="seznam-api">Seznam API</Label>

							<div class="flex flex-row space-x-2">
								<HiddenInput
									bind:inputValue={seznamKey}
									id="seznam-api"
									className="w-full max-w-96"
									placeholder="aBcdEf..."
								/>

								<ButtonLoading
									title={m.house_same_bullock_lend()}
									class="hover:bg-green-700"
									funcWithLoading={handleAddSeznamKey}
								>
									<Save size={20}></Save>
								</ButtonLoading>

								{#if seznamKey}
									<Button onclick={handleDeleteSeznamKey}>
										<Trash size={20}></Trash>
									</Button>
								{/if}
							</div>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			</div>
		</Accordion.Root>
	</Card.Content>
</Card.Root>
