import { m } from '#paraglide/messages.js';
import { z } from 'zod';

import { captchaEnabled } from './config.js';

export const captchaTokenSchema = z
	.string()
	.refine((token) => !captchaEnabled || token.trim().length > 0, {
		error: () => m.captchaRequired()
	});
