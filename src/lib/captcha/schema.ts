import { m } from '#paraglide/messages.js';
import { z } from 'zod';

import { isCaptchaEnabled } from './config.js';

export const captchaTokenSchema = z
	.string()
	.refine((token) => !isCaptchaEnabled || token.trim().length > 0, {
		error: () => m.captchaRequired()
	});
