import dbConn from '@/lib/dbConn';
import TaskModel, { TaskModelInterface } from '@/model/task.model';
import { TaskPUTSchema, TaskSchema } from '@/schema/tasks.schema';
import { getTaskResponse } from '@/types/res/GetResponse.types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	await dbConn(); // Connect to the database
	const reqPayload = await request.json();
	const body = { ...reqPayload };
	if (body.assignedDate !== undefined) {
		body.assignedDate = new Date(body.assignedDate);
	}
	// Validate the request body against the Zod schema
	const validationResult = TaskSchema.safeParse(body);
	if (!validationResult.success) {
		// If validation fails, return a 400 response with the validation errors
		return NextResponse.json(
			{ errors: validationResult.error },
			{ status: 400 },
		);
	}
	try {
		const task = new TaskModel(validationResult.data);
		const result = await task.save();
		return NextResponse.json<TaskModelInterface>(result, {
			status: 201,
		});
	} catch (err) {
		return NextResponse.json({ err, validationResult }, { status: 500 });
	}
}
export async function PUT(request: Request) {
	await dbConn(); // Connect to the database
	const body = await request.json();
	// Validate the request body against the Zod schema
	const validationResult = TaskPUTSchema.safeParse(body);
	if (!validationResult.success) {
		// If validation fails, return a 400 response with the validation errors
		return NextResponse.json(
			{ errors: validationResult.error },
			{ status: 400 },
		);
	}
	try {
		const result = await TaskModel.findByIdAndUpdate(
			validationResult.data.id,
			validationResult.data.data,
		);
		return NextResponse.json(result, {
			status: 201,
		});
	} catch (err) {
		return NextResponse.json({ err }, { status: 500 });
	}
}

export async function GET() {
	await dbConn(); // Connect to the database
	const aggregatedData: getTaskResponse[] = await TaskModel.aggregate([
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
	return NextResponse.json(aggregatedData);
}

export async function DELETE(request: Request) {
	await dbConn(); // Connect to the database
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');
	const deletedTask = await TaskModel.findByIdAndDelete(id);
	if (!deletedTask)
		return NextResponse.json({ message: 'Task not found' }, { status: 404 });
	return NextResponse.json({
		message: 'Task deleted successfully',
	});
}
