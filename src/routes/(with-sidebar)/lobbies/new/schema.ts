import { formSchema as baseFormSchema } from '$lib/schemas/gameSettings';
import { m } from '$paraglide/messages.js';
import { z } from 'zod';

export const formSchema = baseFormSchema.extend({
	maxPlayers: z.coerce
		.number()
		.lte(10, { error: `${m.numberMustBeLowerThan()} 10` })
		.gte(2, { error: `${m.numberMustBeHigherThan()} 2` })
		.default(10),
	private: z.boolean().default(false)
});

export type FormSchema = typeof formSchema;
