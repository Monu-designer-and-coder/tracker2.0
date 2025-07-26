import mongoose, { Schema, Document } from 'mongoose';

export interface CalendarModelInterface extends Document {
	event: string;
	timeStamp: Schema.Types.Date;
	eventId: Schema.Types.ObjectId;
}

const CalendarSchema: Schema<CalendarModelInterface> = new Schema(
	{
		event: {
			type: String,
			required: true,
			trim: true,
		},
		timeStamp: {
			type: Schema.Types.Date,
			required: true,
		},
		eventId: {
			type: Schema.Types.ObjectId,
		},
	},
	{
		timestamps: true,
	},
);

const CalendarModel =
	(mongoose.models.Calendar as mongoose.Model<CalendarModelInterface>) ||
	mongoose.model<CalendarModelInterface>('Calendar', CalendarSchema);
export default CalendarModel;
