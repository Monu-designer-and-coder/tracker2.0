import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * ! Topic Model Interface
 * Represents a specific topic within a chapter.
 */
export interface TopicModelInterface extends Document {
	name: string;
	chapter: Types.ObjectId;
	seqNumber: number;
	done: boolean;
	boards: boolean;
	mains: boolean;
	advanced: boolean;
}

const TopicSchema = new Schema<TopicModelInterface>(
	{
		// * Topic display name
		name: {
			type: String,
			required: true,
			trim: true,
		},
		// * Reference to parent chapter
		chapter: {
			type: Schema.Types.ObjectId,
			ref: 'Chapter',
			required: true,
		},
		// * Order index inside chapter
		seqNumber: { type: Number, default: 0 },
		// * Completion & Exam Relevance Flags
		done: { type: Boolean, default: false },
		boards: { type: Boolean, default: false },
		mains: { type: Boolean, default: false },
		advanced: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

const TopicModel =
	(mongoose.models.Topic as mongoose.Model<TopicModelInterface>) ||
	mongoose.model<TopicModelInterface>('Topic', TopicSchema);

export default TopicModel;

/*
 ! IMPROVEMENTS IMPLEMENTED:
 * 1. Applied Types.ObjectId for strong typing on chapter ref.
 * 2. Added default values for booleans and seqNumber.
 * 3. Improved readability with grouped fields & Better Comments.

  ! FUTURE IMPROVEMENTS:
  TODO: Create compound index on chapter + seqNumber for ordering.
  TODO: Add field-level validation for seqNumber (non-negative).
*/
