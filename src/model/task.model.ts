import mongoose, { Schema, Document } from 'mongoose';

const DaysOfWeek = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];
export interface TaskModelInterface extends Document {
	task: string;
	category: Schema.Types.ObjectId;
	done: boolean;
	assignedDate: Schema.Types.Date;
	completedAt: Schema.Types.Date;
	repeat?: (typeof DaysOfWeek)[number][];
}

export const TaskSchema: Schema<TaskModelInterface> = new Schema(
	{
		category: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'TaskCategory',
		},
		done: {
			type: Boolean,
			default: false,
		},
		repeat: {
			type: [
				{
					type: String,
					enum: DaysOfWeek,
				},
			],
			default: [],
		},
		task: {
			type: String,
			required: true,
		},
		assignedDate: {
			type: Date,
			default: Date.now,
		},
		completedAt: {
			type: Date,
			required: false,
		},
	},
	{
		timestamps: true,
	},
);

const TaskModel =
	(mongoose.models.Task as mongoose.Model<TaskModelInterface>) ||
	mongoose.model<TaskModelInterface>('Task', TaskSchema);
export default TaskModel;
