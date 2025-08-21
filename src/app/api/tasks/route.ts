import dbConn from '@/lib/dbConn';
import TaskTrackerModel from '@/model/task-tracker.model';
import TaskModel from '@/model/task.model';
import { NextResponse } from 'next/server';

/**
 * ! Perform daily task pack-up operation
 * @desc Marks current tasks as past, generates today's recurring tasks
 */
export async function PUT(request: Request) {
	await dbConn();

	const requestBody = await request.json();

	// * Handle daily pack-up process
	if (requestBody?.type === 'dayPackup') {
		const todayDayName = new Date()
			.toLocaleString('en-US', { weekday: 'long' })
			.toLowerCase();

		// * Find tasks scheduled for today
		const todayTasks = await TaskModel.find({ repeat: todayDayName });

		// * Mark current tracked tasks as past
		await TaskTrackerModel.updateMany(
			{ status: 'current' },
			{ status: 'past' },
		);

		// * Create today's tasks and tracker entries
		for (const task of todayTasks) {
			const newTask = await TaskModel.create({
				task: task.task,
				category: task.category,
				done: false,
				assignedDate: new Date(),
			});

			await TaskTrackerModel.create({
				date: new Date(),
				task: newTask._id,
				status: 'current',
			});
		}

		return NextResponse.json({
			message: 'Day pack-up completed successfully',
			tasksAdded: todayTasks.length,
		});
	}

	// * Default response for unsupported types
	return NextResponse.json(requestBody);
}

/*
! IMPROVEMENTS IMPLEMENTED:
 * 1. Replaced aggregation $match with find() for better index utilization.
 * 2. Removed async map side effects and used proper loops/awaits.
 * 3. Centralized today's day name calculation.
 * 4. Made response concise and meaningful.

 ! FUTURE IMPROVEMENTS:
  TODO: Wrap in transaction to ensure atomicity of task + tracker creation.
  TODO: Support batch creation using insertMany for performance.
  TODO: Add logging for monitoring the daily pack-up.
*/
