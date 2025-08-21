import mongoose, { Schema, Document } from 'mongoose';

/**
 * ! Task Category Model Interface
 * Represents a grouping label for tasks.
 */
export interface TaskCategoryModelInterface extends Document {
	category: string;
}

const TaskCategorySchema = new Schema<TaskCategoryModelInterface>(
	{
		// * Category name
		category: {
			type: String,
			required: true,
			trim: true,
			unique: true, // Prevent duplicate category names
		},
	},
	{ timestamps: true },
);

const TaskCategoryModel =
	(mongoose.models
		.TaskCategory as mongoose.Model<TaskCategoryModelInterface>) ||
	mongoose.model<TaskCategoryModelInterface>(
		'TaskCategory',
		TaskCategorySchema,
	);

export default TaskCategoryModel;

/*
! IMPROVEMENTS IMPLEMENTED:
 * 1. Fixed type definitions: 'string' → string (TS type).
 * 2. Added `unique: true` to avoid duplicate category records.
 * 3. Added JSDoc and Better Comments for quick comprehension.

 ! FUTURE IMPROVEMENTS:
  TODO: Add description field for richer category context.
  TODO: Implement soft delete (isActive flag) to preserve history.
*/
