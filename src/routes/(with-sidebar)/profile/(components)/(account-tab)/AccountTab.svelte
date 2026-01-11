<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';
	import { browser } from '$app/environment';
	import * as Avatar from '$components/shadcn/avatar/index';
	import { Button } from '$components/shadcn/button/index';
	import * as Card from '$components/shadcn/card/index';
	import * as Form from '$components/shadcn/form/index';
	import { Input } from '$components/shadcn/input/index';
	import type { UserPublicProfile } from '$lib/api/openapi';
	import { getAvatarSource } from '$lib/utils/helpers';
	import { m } from '$paraglide/messages.js';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	import AvatarUpload from './AvatarUpload.svelte';
	import { formSchema } from './schema';

	interface Props {
		userInfo: UserPublicProfile;
		userForm: SuperValidated<{ name?: string | undefined }>;
		avatarForm: SuperValidated<{ userAvatar: File }>;
	}
	let { userInfo, userForm, avatarForm }: Props = $props();

	let avatarUploadOpen = $state(false);

	// svelte-ignore state_referenced_locally
	const form = superForm(userForm, {
		dataType: 'json',
		validators: zod4Client(formSchema),
		multipleSubmits: 'prevent'
	});
	const { form: formData, enhance } = form;
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
				onclick={() => (avatarUploadOpen = !avatarUploadOpen)}
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

{#if browser}
	<AvatarUpload
		bind:avatarUploadOpen
		{avatarForm}
	/>
{/if}
