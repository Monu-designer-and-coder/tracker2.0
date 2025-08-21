import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * ! Task Tracker Model Interface
 * Tracks a task's status on a specific date.
 */
export interface TaskTrackerModelInterface extends Document {
	date: Date;
	task: Types.ObjectId;
	status: 'current' | 'past';
}

const TaskTrackerSchema = new Schema<TaskTrackerModelInterface>(
	{
		// * The date for which the task status is tracked
		date: {
			type: Date,
			required: true,
		},
		// * Status label
		status: {
			type: String,
			enum: ['current', 'past'],
			required: true,
		},
		// * Linked task reference
		task: {
			type: Schema.Types.ObjectId,
			ref: 'Task',
			required: true,
		},
	},
	{ timestamps: true },
);

const TaskTrackerModel =
	(mongoose.models.TaskTracker as mongoose.Model<TaskTrackerModelInterface>) ||
	mongoose.model<TaskTrackerModelInterface>('TaskTracker', TaskTrackerSchema);

export default TaskTrackerModel;

/*
 ! IMPROVEMENTS IMPLEMENTED:
 * 1. Applied Types.ObjectId for type-safe refs to Task.
 * 2. Added `required: true` on task & status fields for stricter validation.
 * 3. Consistent JSDoc & Better Comments formatting.

  ! FUTURE IMPROVEMENTS:
  TODO: Index date + task for faster lookups in analytics.
  TODO: Add user reference if multi-user task tracking is needed.
  TODO: Support multiple statuses beyond 'current'/'past'.
*/
