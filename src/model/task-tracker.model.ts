import mongoose, { Schema, Document } from 'mongoose';

export interface TaskTrackerModelInterface extends Document {
	date: Schema.Types.Date;
	task: Schema.Types.ObjectId;
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
		task: { type: Schema.Types.ObjectId, ref: 'Task' },
	},
	{
		timestamps: true,
	},
);

const TaskTrackerModel =
	(mongoose.models.TaskTracker as mongoose.Model<TaskTrackerModelInterface>) ||
	mongoose.model<TaskTrackerModelInterface>('TaskTracker', TaskTrackerSchema);
export default TaskTrackerModel;
