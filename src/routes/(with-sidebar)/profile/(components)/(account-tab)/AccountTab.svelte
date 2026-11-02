<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';
	import type { UserPublicProfile } from '#lib/api/openapi.js';
	import { getAvatarSource } from '#lib/utils/helpers.js';
	import { m } from '#paraglide/messages.js';
	import { browser } from '$app/env';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as Avatar from '#components/shadcn/avatar/index.js';
	import { Button } from '#components/shadcn/button/index.js';
	import * as Card from '#components/shadcn/card/index.js';
	import * as Form from '#components/shadcn/form/index.js';
	import { Input } from '#components/shadcn/input/index.js';

	import type AvatarUploadComponent from './AvatarUpload.svelte';
	import { formSchema } from './schema';

	interface Props {
		userInfo: UserPublicProfile;
		userForm: SuperValidated<{ name?: string | undefined }>;
		avatarForm: SuperValidated<{ userAvatar: File }>;
	}
	let { userInfo, userForm, avatarForm }: Props = $props();

	let isAvatarUploadOpen = $state(false);
	let isAvatarLoading = $state(false);
	let AvatarUpload = $state<typeof AvatarUploadComponent>();

	// svelte-ignore state_referenced_locally
	const form = superForm(userForm, {
		dataType: 'json',
		validators: zod4Client(formSchema),
		multipleSubmits: 'prevent'
	});
	const { form: formData, enhance } = form;

	async function openAvatarUpload() {
		if (isAvatarLoading) return;
		isAvatarLoading = true;
		try {
			if (!AvatarUpload) {
				const { default: component } = await import('./AvatarUpload.svelte');
				AvatarUpload = component;
			}
			isAvatarUploadOpen = true;
		} catch {
			toast.error(m.errorGetting());
		} finally {
			isAvatarLoading = false;
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{m.profileTabAccount() + ' ' + userInfo.username}</Card.Title>
		<Card.Description>
			{m.profileDescription()}
		</Card.Description>
	</Card.Header>

	<Card.Content class="flex flex-row flex-wrap gap-6">
		<Avatar.Root class="size-56">
			<Avatar.Image
				src={getAvatarSource(userInfo.avatarHash, userInfo.username)}
				loading="lazy"
				alt="avatar"
			/>

			<Button
				class="absolute top-44 left-28 rounded-full border"
				variant="outline"
				onclick={openAvatarUpload}
				disabled={isAvatarLoading}
				title={m.dark_smart_sheep_seek()}
			>
				<Upload size={24} />
			</Button>
		</Avatar.Root>

		<div class="">
			<Form.Field
				{form}
				name="name"
			>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>{m.registerName()}</Form.Label>
						<Input
							{...props}
							bind:value={$formData.name}
							class="w-60"
							placeholder={userInfo.name}
						/>
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>
		</div>
	</Card.Content>

	<Card.Footer class="space-x-2">
		<form
			method="POST"
			use:enhance
		>
			<Button
				type="submit"
				formaction="?/update"
			>
				{m.save()}
			</Button>

			<Button
				type="submit"
				formaction="?/logout"
			>
				{m.profileLogout()}
			</Button>
		</form>
	</Card.Footer>
</Card.Root>

{#if browser && AvatarUpload}
	<AvatarUpload
		bind:isAvatarUploadOpen
		{avatarForm}
	/>
{/if}
