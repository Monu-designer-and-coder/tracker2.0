import mongoose, { Schema, Document } from 'mongoose';

export interface TaskModelInterface extends Document {
	name: string;
	done: boolean;
	deadline: Schema.Types.Date;
	completedAt: Schema.Types.Date;
}

const TaskSchema: Schema<TaskModelInterface> = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		done: {
			type: Boolean,
			default: false,
		},
		deadline: Schema.Types.Date,
		completedAt: Schema.Types.Date,
	},
	{
		timestamps: true,
	},
);

const TaskModel =
	(mongoose.models.Task as mongoose.Model<TaskModelInterface>) ||
	mongoose.model<TaskModelInterface>('Task', TaskSchema);
export default TaskModel;
