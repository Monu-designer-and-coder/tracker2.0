import mongoose, { Schema, Document } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

/**
 * ! Subject Model Interface
 * Represents a subject within a standard/class.
 */
export interface SubjectModelInterface extends Document {
	name: string;
	standard: string;
}

const SubjectSchema = new Schema<SubjectModelInterface>(
	{
		// * Subject display name
		name: {
			type: String,
			required: true,
			trim: true,
		},
		// * Standard/Class association
		standard: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

// * Attach pagination plugin for aggregated queries
SubjectSchema.plugin(mongooseAggregatePaginate);

const SubjectModel =
	(mongoose.models.Subject as mongoose.Model<SubjectModelInterface>) ||
	mongoose.model<SubjectModelInterface>('Subject', SubjectSchema);

export default SubjectModel;

/*
 ! IMPROVEMENTS IMPLEMENTED:
 * 1. Renamed schema variable to PascalCase for consistency.
 * 2. Added clear interface with explicit string types.
 * 3. Added JSDoc + inline Better Comments for clarity.

  ! FUTURE IMPROVEMENTS:
  TODO: Add unique index on name + standard to avoid duplicate subjects.
  TODO: Consider adding a description field for richer subject info.
*/
