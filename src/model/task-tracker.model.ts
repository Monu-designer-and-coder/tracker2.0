import mongoose, { Schema, Document } from 'mongoose';
import { TaskModelInterface, TaskSchema } from './task.model';

export interface TaskTrackerModelInterface extends Document {
	date: Schema.Types.Date;
	tasks: TaskModelInterface[];
	totalTaskAssigned: number;
	totalTaskDone: number;
	status: 'current' | 'past';
}

const TaskTrackerSchema: Schema<TaskTrackerModelInterface> = new Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ['current', 'past'],
		},
		tasks: [TaskSchema],
		totalTaskAssigned: Number,
		totalTaskDone: Number,
	},
	{
		timestamps: true,
	},
);

const TaskTrackerModel =
	(mongoose.models.Task as mongoose.Model<TaskTrackerModelInterface>) ||
	mongoose.model<TaskTrackerModelInterface>('TaskTracker', TaskTrackerSchema);
export default TaskTrackerModel;
