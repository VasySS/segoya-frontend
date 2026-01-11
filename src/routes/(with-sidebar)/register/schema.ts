import { m } from '$paraglide/messages.js';
import { z } from 'zod';

export const formSchema = z
	.object({
		captcha: z.string(),
		login: z
			.string()
			.min(3, { error: `${m.lengthMustBeGreaterThan()} 2` })
			.max(20, { error: `${m.lengthMustBeLowerThan()} 20` })
			.trim()
			.refine((l) => !l.includes(' '), { error: m.ornate_actual_gopher_adapt() }),
		password: z
			.string()
			.min(5, { error: `${m.lengthMustBeGreaterThan()} 5` })
			.max(20, { error: `${m.lengthMustBeLowerThan()} 20` })
			.trim()
			.refine((p) => !p.includes(' '), { error: m.ornate_actual_gopher_adapt() }),
		passwordAgain: z.string(),
		name: z
			.string()
			.min(3, { error: `${m.lengthMustBeGreaterThan()} 2` })
			.max(20, { error: `${m.lengthMustBeLowerThan()} 20` })
			.trim()
			.optional()
	})
	.refine(
		(schema) => {
			return schema.password === schema.passwordAgain;
		},
		{
			error: m.helpful_bold_snake_quiz(),
			path: ['passwordAgain']
		}
	);

export type FormSchema = typeof formSchema;
