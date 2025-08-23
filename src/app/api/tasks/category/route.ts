import dbConn from '@/lib/dbConn';
import TaskCategoryModel, {
	TaskCategoryModelInterface,
} from '@/model/task-category.model';
import {
	TaskCategoryPUTSchema,
	TaskCategorySchema,
} from '@/schema/tasks.schema';
import { getTaskCategoryResponse } from '@/types/res/GetResponse.types';
import { NextResponse } from 'next/server';

/**
 * ! Create a new task category
 */
export async function POST(request: Request) {
	await dbConn();

	const requestBody = await request.json();
	const validationResult = TaskCategorySchema.safeParse(requestBody);

	if (!validationResult.success) {
		return NextResponse.json(
			{ errors: validationResult.error.format() },
			{ status: 400 },
		);
	}

	try {
		const createdCategory = await TaskCategoryModel.create(
			validationResult.data,
		);
		return NextResponse.json<TaskCategoryModelInterface>(createdCategory, {
			status: 201,
		});
	} catch (err) {
		return NextResponse.json({ error: err }, { status: 500 });
	}
}

/**
 * ! Get all task categories
 */
export async function GET() {
	await dbConn();

	const categories: getTaskCategoryResponse[] =
		await TaskCategoryModel.aggregate([{ $project: { _id: 1, category: 1 } }]);

	return NextResponse.json(categories);
}

/**
 * ! Update task by ID
 */
export async function PUT(request: Request) {
	await dbConn();

	const requestBody = await request.json();
	const validationResult = TaskCategoryPUTSchema.safeParse(requestBody);

	if (!validationResult.success) {
		return NextResponse.json(
			{ errors: validationResult.error.format() },
			{ status: 400 },
		);
	}

	try {
		const updatedTaskCategory = await TaskCategoryModel.findByIdAndUpdate(
			validationResult.data.id,
			validationResult.data.data,
			{ new: true },
		);
		return NextResponse.json<TaskCategoryModelInterface | null>(updatedTaskCategory, {
			status: 200,
		});
	} catch (err) {
		return NextResponse.json({ error: err }, { status: 500 });
	}
}

/**
 * ! Delete task category by ID
 */
export async function DELETE(request: Request) {
	await dbConn();

	const { searchParams } = new URL(request.url);
	const categoryId = searchParams.get('id');

	const deletedCategory = await TaskCategoryModel.findByIdAndDelete(categoryId);

	if (!deletedCategory) {
		return NextResponse.json(
			{ message: 'Task category not found' },
			{ status: 404 },
		);
	}

	return NextResponse.json({ message: 'Task category deleted successfully' });
}

/*
 ! IMPROVEMENTS IMPLEMENTED:
 * 1. Unified naming for clarity (body → requestBody, id → categoryId).
 * 2. Used .create() for brevity and atomic operation.
 * 3. Added Better Comments & JSDoc for maintainability.

  ! FUTURE IMPROVEMENTS:
  TODO: Add validation to prevent deletion of categories still linked to tasks.
  TODO: Support pagination if categories grow large.
*/
