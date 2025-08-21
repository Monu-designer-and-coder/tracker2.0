import mongoose, { Schema, Document, Types } from 'mongoose';

// * Allowed repeat days for recurring tasks
export const DaysOfWeek = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
] as const;

/**
 * ! Task Model Interface
 * Represents a to-do item linked to a category, with optional repeat schedule.
 */
export interface TaskModelInterface extends Document {
	task: string;
	category: Types.ObjectId;
	done?: boolean;
	assignedDate?: Date;
	completedAt?: Date;
	repeat?: (typeof DaysOfWeek)[number][];
}

export const TaskSchema = new Schema<TaskModelInterface>(
	{
		// * Link to the task category
		category: {
			type: Schema.Types.ObjectId,
			ref: 'TaskCategory',
			required: true,
		},
		// * Completion status
		done: {
			type: Boolean,
			default: false,
		},
		// * Repeat pattern by days of the week
		repeat: [
			{
				type: String,
				enum: DaysOfWeek,
			},
		],
		// * Task description
		task: {
			type: String,
			required: true,
			trim: true,
		},
		// * Assignment & completion dates
		assignedDate: {
			type: Date,
		},
		completedAt: {
			type: Date,
		},
	},
	{ timestamps: true },
);

const TaskModel =
	(mongoose.models.Task as mongoose.Model<TaskModelInterface>) ||
	mongoose.model<TaskModelInterface>('Task', TaskSchema);

export default TaskModel;

/*
 ! IMPROVEMENTS IMPLEMENTED:
 * 1. Added `as const` for DaysOfWeek to leverage TS literal union types.
 * 2. Used Types.ObjectId for type safety on category reference.
 * 3. Set default value for 'done' to ensure consistent state.
 * 4. Trimmed task strings to maintain clean DB values.

  ! FUTURE IMPROVEMENTS:
  TODO: Add index on category + done to speed up status/category filters.
  TODO: Support custom repeat intervals (e.g., every 2 days).
  TODO: Add priority field for better task sorting.
*/
