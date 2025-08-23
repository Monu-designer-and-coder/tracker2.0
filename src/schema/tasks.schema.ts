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
	assignedDate: z.date().optional(),
	completedDate: z.date().optional(),
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
export const TaskFormSchema = z.object({
	task: z
		.string()
		.trim()
		.min(3, 'This field must be at least 3 character long'),
	category: z.string(),
	done: z.boolean().optional(),
	assignedDate: z.date().optional(),
	completedDate: z.date().optional(),
	repeat: z.boolean().optional(),
	sunday: z.boolean().optional(),
	monday: z.boolean().optional(),
	tuesday: z.boolean().optional(),
	wednesday: z.boolean().optional(),
	thursday: z.boolean().optional(),
	friday: z.boolean().optional(),
	saturday: z.boolean().optional(),
});
export const TaskCategoryPUTSchema = z.object({
	id: z.string().optional(),
	data: z.object({ category: z.string().trim().min(3, "Entry must be of at least 3 char.") }),
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
		assignedDate: z.date().optional(),
		completedDate: z.date().optional(),
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
	date: z.date(),
	task: z.string(),
	status: z.enum(['current', 'past']),
});

export const TaskTrackerPUTSchema = z.object({
	id: z.string(),
	data: z.object({
		date: z.date().optional(),
		task: z.string().optional(),
		status: z.enum(['current', 'past']).optional(),
	}),
});
