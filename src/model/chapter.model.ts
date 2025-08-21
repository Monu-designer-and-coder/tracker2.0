import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * ! Chapter Model Interface
 * Represents a curriculum chapter linked to a subject.
 */
export interface ChapterModelInterface extends Document {
	name: string;
	subject: Types.ObjectId;
	seqNumber: number;
	done: boolean;
	selectionDiary: boolean;
	onePager: boolean;
	DPP: boolean;
	Module: boolean;
	PYQ: boolean;
	ExtraMaterial: boolean;
}

const ChapterSchema = new Schema<ChapterModelInterface>(
	{
		// * Chapter display name
		name: {
			type: String,
			required: true,
			trim: true,
		},
		// * Reference to related subject
		subject: {
			type: Schema.Types.ObjectId,
			ref: 'Subject',
			required: true,
		},
		// * Chapter ordering sequence
		seqNumber: {
			type: Number,
			default: 0,
		},
		// * Completion & Resource Flags
		done: { type: Boolean, default: false },
		selectionDiary: { type: Boolean, default: false },
		onePager: { type: Boolean, default: false },
		DPP: { type: Boolean, default: false },
		Module: { type: Boolean, default: false },
		PYQ: { type: Boolean, default: false },
		ExtraMaterial: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

const ChapterModel =
	(mongoose.models.Chapter as mongoose.Model<ChapterModelInterface>) ||
	mongoose.model<ChapterModelInterface>('Chapter', ChapterSchema);

export default ChapterModel;

/*
 ! IMPROVEMENTS IMPLEMENTED:
 * 1. Unified boolean casing for TypeScript type consistency.
 * 2. Added clear JSDoc and inline Better Comments for maintainers.
 * 3. Used Types.ObjectId for subject ref type safety.
 * 4. Structured schema fields logically: identity, relationship, metadata.

  ! FUTURE IMPROVEMENTS:
  TODO: Add compound index on subject + seqNumber for faster sorting.
  TODO: Add validation hook to ensure seqNumber is unique within subject.
*/
