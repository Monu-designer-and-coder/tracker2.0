import { z } from 'zod';

export const TaskCategorySchema = z.object({
	category: z
		.string()
		.trim()
		.min(3, 'This field must be at least 3 character long'),
});

export const TaskSchema = z.object({
	task: z
		.string()
		.trim()
		.min(3, 'This field must be at least 3 character long'),
	category: z.string(),
	done: z.boolean().optional(),
	assignDate: z.coerce.date().optional(),
	completedDate: z.coerce.date().optional(),
	repeat: z
		.array(
			z.enum([
				'sunday',
				'monday',
				'tuesday',
				'wednesday',
				'thursday',
				'friday',
				'saturday',
				'',
			]),
		)
		.optional(),
});
export const TaskPUTSchema = z.object({
	id: z.string().optional(),
	data: z.object({
		task: z
			.string()
			.trim()
			.min(3, 'This field must be at least 3 character long')
			.optional(),
		category: z.string().optional(),
		done: z.boolean().optional(),
		assignDate: z.coerce.date().optional(),
		completedDate: z.coerce.date().optional(),
		repeat: z
			.array(
				z.enum([
					'sunday',
					'monday',
					'tuesday',
					'wednesday',
					'thursday',
					'friday',
					'saturday',
					'',
				]),
			)
			.optional(),
	}),
});

export const TaskTrackerSchema = z.object({
	date: z.coerce.date(),
	task: z.string(),
	status: z.enum(['current', 'past']),
});

export const TaskTrackerPUTSchema = z.object({
	id: z.string(),
	data: z.object({
		date: z.coerce.date().optional(),
		task: z.string().optional(),
		status: z.enum(['current', 'past']).optional(),
	}),
});
