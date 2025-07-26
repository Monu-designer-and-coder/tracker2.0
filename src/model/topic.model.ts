import mongoose, { Schema, Document } from 'mongoose';

export interface TopicModelInterface extends Document {
	name: string;
	chapter: Schema.Types.ObjectId;
	seqNumber: number;
	done: boolean;
	boards: boolean;
	mains: boolean;
	advanced: boolean;
}

const TopicSchema: Schema<TopicModelInterface> = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		chapter: {
			type: Schema.Types.ObjectId,
			ref: 'Chapter',
			required: true,
		},

		seqNumber: Number,
		done: Boolean,
		boards: Boolean,
		mains: Boolean,
		advanced: Boolean,
	},
	{
		timestamps: true,
	},
);

const TopicModel =
	(mongoose.models.Topic as mongoose.Model<TopicModelInterface>) ||
	mongoose.model<TopicModelInterface>('Topic', TopicSchema);
export default TopicModel;
