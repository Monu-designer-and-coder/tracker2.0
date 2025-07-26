import mongoose, { Schema, Document } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
export interface SubjectModelInterface extends Document {
	name: string;
	standard: string;
}

const subjectSchema: Schema<SubjectModelInterface> = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		standard: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

subjectSchema.plugin(mongooseAggregatePaginate);

const SubjectModel =
	(mongoose.models.Subject as mongoose.Model<SubjectModelInterface>) ||
	mongoose.model<SubjectModelInterface>('Subject', subjectSchema);
export default SubjectModel;
