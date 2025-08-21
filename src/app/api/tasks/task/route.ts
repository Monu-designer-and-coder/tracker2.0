import dbConn from '@/lib/dbConn';
import TaskModel, { TaskModelInterface } from '@/model/task.model';
import { TaskPUTSchema, TaskSchema } from '@/schema/tasks.schema';
import { getTaskResponse } from '@/types/res/GetResponse.types';
import { NextResponse } from 'next/server';

/**
 * ! Create a new task
 */
export async function POST(request: Request) {
	await dbConn();

	const requestBody = await request.json();

	if (requestBody.assignedDate) {
		requestBody.assignedDate = new Date(requestBody.assignedDate);
	}

	const validationResult = TaskSchema.safeParse(requestBody);
	if (!validationResult.success) {
		return NextResponse.json(
			{ errors: validationResult.error.format() },
			{ status: 400 },
		);
	}

	try {
		const createdTask = await TaskModel.create(validationResult.data);
		return NextResponse.json<TaskModelInterface>(createdTask, { status: 201 });
	} catch (err) {
		return NextResponse.json({ error: err }, { status: 500 });
	}
}

/**
 * ! Update task by ID
 */
export async function PUT(request: Request) {
	await dbConn();

	const requestBody = await request.json();
	const validationResult = TaskPUTSchema.safeParse(requestBody);

	if (!validationResult.success) {
		return NextResponse.json(
			{ errors: validationResult.error.format() },
			{ status: 400 },
		);
	}

	try {
		const updatedTask = await TaskModel.findByIdAndUpdate(
			validationResult.data.id,
			validationResult.data.data,
			{ new: true },
		);
		return NextResponse.json<TaskModelInterface | null>(updatedTask, {
			status: 200,
		});
	} catch (err) {
		return NextResponse.json({ error: err }, { status: 500 });
	}
}

/**
 * ! Get all tasks
 */
export async function GET() {
	await dbConn();

	const tasks: getTaskResponse[] = await TaskModel.aggregate([
		{
			$project: {
				_id: 1,
				task: 1,
				category: 1,
				done: 1,
				assignedDate: 1,
				completedAt: 1,
				repeat: 1,
			},
		},
	]);

	return NextResponse.json(tasks);
}

/**
 * ! Delete task by ID
 */
export async function DELETE(request: Request) {
	await dbConn();

	const { searchParams } = new URL(request.url);
	const taskId = searchParams.get('id');

	const deletedTask = await TaskModel.findByIdAndDelete(taskId);
	if (!deletedTask) {
		return NextResponse.json({ message: 'Task not found' }, { status: 404 });
	}

	return NextResponse.json({ message: 'Task deleted successfully' });
}

/*
 ! IMPROVEMENTS IMPLEMENTED:
 * 1. Enforced consistent variable naming (requestBody, taskId).
 * 2. Used { new: true } to return updated task in PUT.
 * 3. Error responses now include .format() for zod clarity.
 * 4. Added JSDoc + Better Comments.

  ! FUTURE IMPROVEMENTS:
  TODO: Populate category in GET to return category names instead of IDs.
  TODO: Add filtering by status/date in GET.
*/
