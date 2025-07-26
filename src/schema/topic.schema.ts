import { z } from 'zod';

export const TopicValidationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'The subject Length must be of al least 3 character!'),

	chapter: z.string().min(1, 'Chapter is mandatory'),
	done: z.boolean(),
	seqNumber: z.number(),
	boards: z.boolean(),
	mains: z.boolean(),
	advanced: z.boolean(),
});
