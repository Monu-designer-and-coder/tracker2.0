import mongoose, { Schema, Document } from 'mongoose';

export interface TaskCategoryModelInterface extends Document {
	category: 'string';
}

const TaskCategorySchema: Schema<TaskCategoryModelInterface> = new Schema(
	{
		category: {
			type: 'string',
			required: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	},
);

const TaskCategoryModel =
	(mongoose.models.Task as mongoose.Model<TaskCategoryModelInterface>) ||
	mongoose.model<TaskCategoryModelInterface>(
		'TaskCategory',
		TaskCategorySchema,
	);
export default TaskCategoryModel;
