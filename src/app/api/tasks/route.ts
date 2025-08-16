import dbConn from '@/lib/dbConn';
import TaskTrackerModel from '@/model/task-tracker.model';
import TaskModel from '@/model/task.model';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
	await dbConn(); // Connect to the database
	const body = await request.json();
	if (body?.type === 'dayPackup') {
		const getTheTasksToAddToday = await TaskModel.aggregate([
			{
				$match: {
					repeat: new Date()
						.toLocaleString('en-US', { weekday: 'long' })
						.toLowerCase(),
				},
			},
		]);
		const PackupLastDay = await TaskTrackerModel.aggregate([
			{
				$match: {
					status: 'current',
				},
			},
		]);
		const newPackupLastDay = PackupLastDay.map(async (task) => {
			await TaskTrackerModel.findByIdAndUpdate(task._id, { status: 'past' });
		});
		const NewCurrentData = getTheTasksToAddToday.map(async (item) => {
			const task = new TaskModel({
				task: item.task,
				category: item.category,
				done: false,
				assignedDate: new Date(),
			});
			const taskTracker = new TaskTrackerModel({
				date: new Date(),
				task: task._id,
				status: 'current',
			});
			await task.save();
			await taskTracker.save();
		});

		return NextResponse.json({
			getTheTasksToAddToday,
			NewCurrentData,
			PackupLastDay,
			newPackupLastDay,
			repeat: new Date(),
		});
	}
	return NextResponse.json(body);
}
