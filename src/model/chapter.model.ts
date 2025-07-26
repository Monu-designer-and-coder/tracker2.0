import mongoose, { Schema, Document } from 'mongoose';

export interface ChapterModelInterface extends Document {
	name: string;
	subject: Schema.Types.ObjectId;
	seqNumber: number;
	done: boolean;
	selectionDiary: boolean;
}

const ChapterSchema: Schema<ChapterModelInterface> = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		subject: {
			type: Schema.Types.ObjectId,
			ref: 'Subject',
			required: true,
		},
		seqNumber: {
			type: Number,
			default: 0,
		},
		done: {
			type: Boolean,
			default: false,
		},
		selectionDiary: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

const ChapterModel =
	(mongoose.models.Chapter as mongoose.Model<ChapterModelInterface>) ||
	mongoose.model<ChapterModelInterface>('Chapter', ChapterSchema);
export default ChapterModel;
