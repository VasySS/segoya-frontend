<script lang="ts">
	import * as Dialog from '$components/shadcn/dialog/index';
	import * as Form from '$components/shadcn/form/index';
	import { Input } from '$components/shadcn/input/index';
	import { Label } from '$components/shadcn/label/index';
	import ButtonLoading from '$components/shared/button-loading/button-loading.svelte';
	import { m } from '$paraglide/messages.js';
	import Cropper from 'cropperjs';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	import { avatarSchema } from './schema';

	import 'cropperjs/dist/cropper.css';

	interface Props {
		avatarForm: SuperValidated<{ userAvatar: File }>;
		avatarUploadOpen?: boolean;
	}
	let { avatarForm, avatarUploadOpen = $bindable(false) }: Props = $props();

	let imgPreview = $state<HTMLImageElement>();
	let cropper = $state<Cropper>();

	// svelte-ignore state_referenced_locally
	const form = superForm(avatarForm, {
		dataType: 'json',
		validators: zod4Client(avatarSchema),
		multipleSubmits: 'prevent'
	});
	const { enhance: avatarEnhance, delayed, form: formData } = form;

	onDestroy(() => {
		cropper?.destroy();
	});

	function handleFileUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// 2MB limit
		if (file.size > 2 * 1024 * 1024) {
			toast.error(m.misty_petty_cuckoo_exhale());
			return;
		}

		const reader = new FileReader();
		reader.addEventListener('load', (e) => {
			const result = e.target?.result;
			if (!result || !imgPreview) return;

			imgPreview.src = result as string;
			try {
				initCropper();
			} catch {
				toast.error(m.heroic_plain_reindeer_tickle(), {
					description: 'Failed to initialize image cropper'
				});
			}
		});

		reader.readAsDataURL(file);
	}

	function initCropper() {
		if (!imgPreview) return;
		if (cropper) cropper.destroy();

		cropper = new Cropper(imgPreview, {
			aspectRatio: 1 / 1,
			viewMode: 3,
			dragMode: 'move',
			center: true
		});
	}

	function submitAvatarForm() {
		cropper?.getCroppedCanvas().toBlob(
			(blob) => {
				if (!blob) return;

				$formData.userAvatar = new File([blob], 'avatar', { type: blob.type });
				form.submit();
			},
			'image/webp',
			0.7
		);
	}
</script>

<form
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
				<Dialog.Root bind:open={avatarUploadOpen}>
					<Dialog.Content class="space-y-1">
						<Dialog.Header>
							<Dialog.Title>{m.avatarUpload()}</Dialog.Title>
							<Dialog.Description></Dialog.Description>
						</Dialog.Header>

						<div class="flex flex-col items-center space-y-3">
							<img
								{...props}
								bind:this={imgPreview}
								alt=""
								class="size-72 sm:size-80 md:size-96"
							/>

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
								onclick={() => {
									submitAvatarForm();
								}}
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
