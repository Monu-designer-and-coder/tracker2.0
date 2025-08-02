import { z } from 'zod';

export const chapterValidationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'The subject Length must be of al least 3 character!'),
	subject: z.string().min(1, 'Standard is mandatory'),
	seqNumber: z.string(),
	done: z.boolean(),
	selectionDiary: z.boolean(),
	onePager: z.boolean(),
	DPP: z.boolean(),
	Module: z.boolean(),
	PYQ: z.boolean(),
	ExtraMaterial: z.boolean(),
});
export const chapterValidationSchemaBackend = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'The subject Length must be of al least 3 character!'),
	subject: z.string().min(1, 'Standard is mandatory'),
	seqNumber: z.number(),
	done: z.boolean(),
	selectionDiary: z.boolean(),
	onePager: z.boolean(),
	DPP: z.boolean(),
	Module: z.boolean(),
	PYQ: z.boolean(),
	ExtraMaterial: z.boolean(),
});
