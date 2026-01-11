import { m } from '$paraglide/messages.js';
import { z } from 'zod';

export const formSchema = z.object({
	captcha: z.string(),
	redirectTo: z.string().optional(),
	login: z
		.string()
		.min(3, { error: `${m.lengthMustBeGreaterThan()} 2` })
		.max(20, { error: `${m.lengthMustBeLowerThan()} 20` })
		.trim()
		.refine((l) => !l.includes(' '), { error: m.ornate_actual_gopher_adapt() }),
	password: z
		.string()
		.min(4, { error: `${m.lengthMustBeGreaterThan()} 4` })
		.max(20, { error: `${m.lengthMustBeLowerThan()} 20` })
		.trim()
		.refine((p) => !p.includes(' '), { error: m.even_trite_mink_thrive() })
});

export type FormSchema = typeof formSchema;
