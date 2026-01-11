<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import * as Accordion from '$components/shadcn/accordion/index';
	import Button from '$components/shadcn/button/button.svelte';
	import CharactersStaggered from '$components/shared/animation/CharactersStaggered.svelte';
	import { STATIC_BASE_URL } from '$lib/api/base';
	import { m } from '$paraglide/messages.js';

	// vite injects this
	const appVersion = `v${__VER__}`;
	const githubLink = 'https://github.com/VasySS';
	const telegramLink = 'https://t.me/vasyss';
</script>

<svelte:head>
	<link
		rel="preload"
		fetchpriority="high"
		as="image"
		href="{STATIC_BASE_URL}/irkutsk.webp"
	/>

	<title>Segoya</title>
</svelte:head>

<div class="flex-col">
	<nav class="bg-primary flex items-center border-b px-5 py-3">
		<p class="text-xl">Segoya</p>

		<div class="grow"></div>

		<a
			class="text-xl hover:underline"
			href={resolve('/(with-sidebar)/login')}
		>
			{m.loginLogin()}</a
		>
	</nav>

	<main class="h-dvh">
		<div class="flex flex-col border-b lg:flex-row">
			<div class="h-72 py-12 pl-10 md:py-16">
				<div class="relative w-max">
					<h1 class="text-3xl sm:text-4xl md:text-5xl">Segoya</h1>

					<CharactersStaggered
						text={appVersion}
						className="absolute top-2 -right-20 text-xl"
						delay={0.05}
						duration={0.5}
						direction="UP"
					></CharactersStaggered>
				</div>

				<CharactersStaggered
					text={m.simple_north_hare_pat()}
					className="text-base md:text-xl flex-wrap"
					separator=" "
					delay={0.07}
					duration={1}
					direction="RIGHT"
				></CharactersStaggered>
			</div>

			<div
				class="bg-primary mr-auto mb-14 ml-auto space-y-2 self-center rounded-sm p-2 lg:mr-52 lg:mb-0"
			>
				<Button
					class="flex flex-row items-center space-x-2 p-1"
					href={githubLink}
					target="_blank"
				>
					<img
						loading="lazy"
						src={asset('/logos/github-logo.svg')}
						width={32}
						height={32}
						alt="github"
					/>
					<p class="text-2xl">GitHub</p>
				</Button>

				<Button
					class="flex flex-row items-center space-x-2"
					href={telegramLink}
					target="_blank"
				>
					<img
						loading="lazy"
						src={asset('/logos/telegram-logo.svg')}
						width={32}
						height={32}
						alt="telegram"
					/>
					<p class="text-2xl">Telegram</p>
				</Button>
			</div>
		</div>

		<div class="flex flex-col lg:min-h-min lg:flex-row lg:border-b">
			<div class="bg-secondary py-12 pr-10 pl-10 lg:w-1/2">
				<h1 class="text-xl font-bold 2xl:text-2xl">
					{m.landingDiscoverWorld()} <br />
					{m.landingVirtualExpl()}
				</h1>
				<p class="pt-4 text-base 2xl:text-xl">
					{m.landingDescription2()}
				</p>
				<div class="flex flex-col justify-between pt-10 lg:flex-row lg:space-x-8 lg:pt-20">
					<div class="flex flex-col lg:w-1/2">
						<p class="pb-4 font-bold">{m.challengeYourself()}</p>
						<p>{m.challengeYourselfDescr()}</p>
					</div>
					<div class="flex flex-col pt-10 lg:w-1/2 lg:pt-0">
						<p class="pb-4 font-bold">{m.competeWithOthers()}</p>
						<p>
							{m.competeWithOthersDescr()}
						</p>
					</div>
				</div>

				<Button
					class="mt-8"
					href={resolve('/(with-sidebar)/register')}
					>{m.registerCreate()}
				</Button>
			</div>

			<div
				class="h-96 w-full border-t border-b bg-[url('{STATIC_BASE_URL}/irkutsk.webp')] bg-cover bg-fixed bg-center lg:h-auto lg:w-1/2 lg:border-0"
			></div>
		</div>

		<div class="border-b pt-12 pb-20">
			<h1 class="text-center">{m.technologiesUsed()}</h1>
			<div class="flex flex-col items-center justify-center px-10 lg:flex-row lg:space-x-20">
				<img
					loading="lazy"
					src={asset('/logos/svelte-logo.svg')}
					height={100}
					width={200}
					alt="Svelte"
				/>
				<img
					loading="lazy"
					src={asset('/logos/golang-logo.svg')}
					height={100}
					width={130}
					alt="Golang"
				/>
				<img
					loading="lazy"
					src={asset('/logos/postgresql-logo.svg')}
					class="mt-16 lg:mt-0"
					height={100}
					width={300}
					alt="Postgresql"
				/>
			</div>
		</div>

		<div class="bg-secondary flex flex-col justify-center px-6 pt-12 pb-20 sm:px-32">
			<h1 class="text-center">FAQ</h1>

			<Accordion.Root type="multiple">
				<Accordion.Item value="item-1">
					<Accordion.Trigger>{m.tasty_weary_cat_beam()}</Accordion.Trigger>
					<Accordion.Content>
						{m.any_cozy_otter_arise()}
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="item-2">
					<Accordion.Trigger>{m.last_bold_gecko_swim()}</Accordion.Trigger>
					<Accordion.Content>
						{m.faqHowToPlay()}
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="item-3">
					<Accordion.Trigger>{m.isItFree()}</Accordion.Trigger>
					<Accordion.Content>
						{m.faqIsItFree()}
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	</main>
</div>
