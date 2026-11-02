<script lang="ts">
	import { m } from '#paraglide/messages.js';
	import { onDestroy } from 'svelte';
	import Cropper, { type CropArea } from 'svelte-easy-crop';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as Dialog from '#components/shadcn/dialog/index.js';
	import * as Form from '#components/shadcn/form/index.js';
	import { Input } from '#components/shadcn/input/index.js';
	import { Label } from '#components/shadcn/label/index.js';
	import ButtonLoading from '#components/shared/button-loading/button-loading.svelte';

	import { createCroppedAvatar, loadAvatarImage } from './cropAvatar';
	import { avatarSchema } from './schema';

	interface Props {
		avatarForm: SuperValidated<{ userAvatar: File }>;
		isAvatarUploadOpen?: boolean;
	}
	let { avatarForm, isAvatarUploadOpen = $bindable(false) }: Props = $props();

	let image = $state.raw<HTMLImageElement>();
	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let cropArea = $state<CropArea>();
	let isCropping = $state(false);
	let uploadVersion = 0;

	// svelte-ignore state_referenced_locally
	const form = superForm(avatarForm, {
		dataType: 'json',
		validators: zod4Client(avatarSchema),
		multipleSubmits: 'prevent',
		onResult: ({ result }) => {
			if (!(result.type === 'redirect' || result.type === 'success')) {
				return;
			}

			isAvatarUploadOpen = false;
			resetImage();
		}
	});
	const { enhance: avatarEnhance, delayed, form: formData } = form;

	$effect(() => {
		if (!isAvatarUploadOpen) resetImage();
	});

	onDestroy(() => {
		uploadVersion++;
	});

	function resetImage() {
		uploadVersion++;
		image = undefined;
		cropArea = undefined;
		crop = { x: 0, y: 0 };
		zoom = 1;
	}

	async function handleFileUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// 2MB limit
		if (file.size > 2 * 1024 * 1024) {
			toast.error(m.misty_petty_cuckoo_exhale());
			return;
		}

		resetImage();
		const version = uploadVersion;
		try {
			const nextImage = await loadAvatarImage(file);
			if (version === uploadVersion) image = nextImage;
		} catch {
			if (version === uploadVersion) {
				toast.error(m.heroic_plain_reindeer_tickle(), {
					description: 'Failed to initialize image cropper'
				});
			}
		}
	}

	async function submitAvatarForm() {
		if (!image || !cropArea || isCropping) return;
		const version = uploadVersion;
		isCropping = true;
		try {
			const file = await createCroppedAvatar(image, cropArea);
			if (version !== uploadVersion) return;
			$formData.userAvatar = file;
			form.submit();
		} catch {
			toast.error(m.heroic_plain_reindeer_tickle(), {
				description: 'Failed to submit avatar'
			});
		} finally {
			isCropping = false;
		}
	}
</script>

<form
	aria-label="avatar-upload"
	method="POST"
	action="?/update_avatar"
	enctype="multipart/form-data"
	use:avatarEnhance
>
	<Form.Field
		{form}
		name="userAvatar"
	>
		<Form.Control>
			{#snippet children({ props })}
				<Dialog.Root bind:open={isAvatarUploadOpen}>
					<Dialog.Content class="space-y-1">
						<Dialog.Header>
							<Dialog.Title>{m.avatarUpload()}</Dialog.Title>
							<Dialog.Description></Dialog.Description>
						</Dialog.Header>

						<div class="flex flex-col items-center space-y-3">
							<div class="bg-muted relative size-72 max-w-full sm:size-80 md:size-96">
								{#if image}
									<Cropper
										image={image.src}
										bind:crop
										bind:zoom
										aspect={1}
										tabindex={0}
										oncropcomplete={({ pixels }) => {
											cropArea = pixels.width > 0 && pixels.height > 0 ? pixels : undefined;
										}}
									/>
								{/if}
							</div>

							<Label for="avatar-upload">{m.funny_simple_fireant_loop()}</Label>

							<Input
								{...props}
								id="avatar-upload"
								onchange={handleFileUpload}
								type="file"
								accept="image/*"
								class="text-sm"
							/>

							<Form.FieldErrors />
						</div>

						<Dialog.Footer>
							<ButtonLoading
								onclick={submitAvatarForm}
								disabled={!cropArea || isCropping}
								{delayed}
							>
								{m.save()}
							</ButtonLoading>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			{/snippet}
		</Form.Control>
	</Form.Field>
</form>
