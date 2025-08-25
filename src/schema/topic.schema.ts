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

export const TopicValidationPUTSchema = z.object({
	id: z.string(),
	data: z.object({
		name: z
			.string()
			.trim()
			.min(3, 'The subject Length must be of al least 3 character!')
			.optional(),

		chapter: z.string().min(1, 'Chapter is mandatory').optional(),
		done: z.boolean().optional(),
		seqNumber: z.number().optional(),
		boards: z.boolean().optional(),
		mains: z.boolean().optional(),
		advanced: z.boolean().optional(),
	}),
});
