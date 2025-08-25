import { z } from 'zod';

export const subjectValidationSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'The subject Length must be of al least 3 character!'),
	standard: z.string().min(1, 'Standard is mandatory'),
});
export const subjectValidationPUTSchema = z.object({
	id: z.string(),
	data: z.object({
		name: z
			.string()
			.trim()
			.min(3, 'The subject Length must be of al least 3 character!'),
		standard: z.string().min(1, 'Standard is mandatory'),
	}),
});
