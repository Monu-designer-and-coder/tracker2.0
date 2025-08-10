import dbConn from '@/lib/dbConn';
import TaskCategoryModel, {
	TaskCategoryModelInterface,
} from '@/model/task-category.model';
import { TaskCategorySchema } from '@/schema/tasks.schema';
import { getTaskCategoryResponse } from '@/types/res/GetResponse.types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	await dbConn(); // Connect to the database
	const body = await request.json();
	// Validate the request body against the Zod schema
	const validationResult = TaskCategorySchema.safeParse(body);
	if (!validationResult.success) {
		// If validation fails, return a 400 response with the validation errors
		return NextResponse.json(
			{ errors: validationResult.error },
			{ status: 400 },
		);
	}
	try {
		const taskCategory = new TaskCategoryModel(validationResult.data);
		const result = await taskCategory.save();
		return NextResponse.json<TaskCategoryModelInterface>(result, {
			status: 201,
		});
	} catch (err) {
		return NextResponse.json({ err, validationResult }, { status: 500 });
	}
}

export async function GET() {
	await dbConn(); // Connect to the database
	const aggregatedData: getTaskCategoryResponse[] =
		await TaskCategoryModel.aggregate([
			{
				$project: {
					_id: 1,
					category: 1,
				},
			},
		]);
	return NextResponse.json(aggregatedData);
}

export async function DELETE(request: Request) {
	await dbConn(); // Connect to the database
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');
	const deletedTaskCategory = await TaskCategoryModel.findByIdAndDelete(id);
	if (!deletedTaskCategory)
		return NextResponse.json(
			{ message: 'TaskCategory not found' },
			{ status: 404 },
		);
	return NextResponse.json({
		message: 'TaskCategory deleted successfully',
	});
}
