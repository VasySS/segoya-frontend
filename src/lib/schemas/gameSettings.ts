import { Provider } from '#lib/api/openapi.js';
import { areaSelectionSchema } from '#lib/play-areas/geometry.js';
import { m } from '#paraglide/messages.js';
import { z } from 'zod';

export const formSchema = z.object({
	provider: Provider.default('google'),
	playArea: areaSelectionSchema,
	movementAllowed: z.boolean().default(true),
	rounds: z.coerce
		.number()
		.lte(10, { error: `${m.numberMustBeLowerThan()} 10` })
		.gte(1, { error: `${m.numberMustBeHigherThan()} 1` })
		.default(5),
	timerEnabled: z.boolean().default(true),
	timerSeconds: z.coerce
		.number()
		.int()
		.lte(600, { error: `${m.numberMustBeLowerThan()} 600` })
		.gte(0, { error: `${m.numberMustBeHigherThan()} 0` })
		.refine((seconds) => seconds === 0 || seconds >= 10, {
			error: `${m.numberMustBeHigherThan()} 10`
		})
		.default(300)
});

export type FormSchema = typeof formSchema;
