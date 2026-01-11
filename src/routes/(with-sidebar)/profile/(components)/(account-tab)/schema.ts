import { m } from '$paraglide/messages.js';
import { z } from 'zod';

export const formSchema = z.object({
	name: z
		.string()
		.min(3, { error: `${m.lengthMustBeGreaterThan()} 3` })
		.max(32, { error: `${m.lengthMustBeLowerThan()} 32` })
		.trim()
		.optional()
});

export const avatarSchema = z.object({
	userAvatar: z.file().max(2_000_000, { error: 'Max 2 MB upload size.' })
	// .refine((file) => file.type.startsWith('image/'), { error: 'Please upload an image.' })
});
