import dbConn from '@/lib/dbConn';
import TaskTrackerModel, {
	TaskTrackerModelInterface,
} from '@/model/task-tracker.model';
import { TaskTrackerPUTSchema, TaskTrackerSchema } from '@/schema/tasks.schema';
import {
	getTaskResponse,
	getTaskTrackerResponse,
} from '@/types/res/GetResponse.types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	await dbConn(); // Connect to the database
	const reqPayload = await request.json();
	const body = { ...reqPayload, date: new Date(reqPayload.date) };
	// Validate the request body against the Zod schema
	const validationResult = TaskTrackerSchema.safeParse(body);
	if (!validationResult.success) {
		// If validation fails, return a 400 response with the validation errors
		return NextResponse.json(
			{ errors: JSON.parse(validationResult.error.message) },
			{ status: 400 },
		);
	}
	try {
		const task = new TaskTrackerModel(validationResult.data);
		const result = await task.save();
		return NextResponse.json<TaskTrackerModelInterface>(result, {
			status: 201,
		});
	} catch (err) {
		return NextResponse.json({ err }, { status: 500 });
	}
}
export async function PUT(request: Request) {
	await dbConn(); // Connect to the database
	const body = await request.json();
	// Validate the request body against the Zod schema
	const validationResult = TaskTrackerPUTSchema.safeParse(body);
	if (!validationResult.success) {
		// If validation fails, return a 400 response with the validation errors
		return NextResponse.json(
			{ errors: JSON.parse(validationResult.error.message) },
			{ status: 400 },
		);
	}
	try {
		const result = await TaskTrackerModel.findByIdAndUpdate(
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

export async function GET(request: Request) {
	await dbConn(); // Connect to the database
	const { searchParams } = new URL(request.url);
	if (searchParams.get('status') == 'past') {
		const aggregatedData: getTaskTrackerResponse[] =
			await TaskTrackerModel.aggregate([
				{
					$match: {
						status: 'past',
					},
				},
				{
					$lookup: {
						from: 'tasks',
						localField: 'task',
						foreignField: '_id',
						pipeline: [
							{
								$project: {
									_id: 1,
									task: 1,
									category: 1,
									done: 1,
									assignedDate: 1,
									completedAt: 1,
								},
							},
						],
						as: 'taskDetails',
					},
				},
				{
					$addFields: {
						taskDetails: {
							$first: '$taskDetails',
						},
					},
				},
				{
					$group: {
						_id: {
							$dateToString: {
								format: '%Y-%m-%d',
								date: '$date',
							},
						},
						taskDetails: {
							$addToSet: '$taskDetails',
						},
						totalTaskAssigned: {
							$count: {},
						},
					},
				},
				{
					$addFields: {
						totalTaskDone: {
							$size: {
								$filter: {
									input: '$taskDetails',
									as: 'task',
									cond: '$$task.done',
								},
							},
						},
					},
				},
				{
					$addFields: {
						pointsRatio: {
							$divide: ['$totalTaskDone', '$totalTaskAssigned'],
						},
					},
				},
				{
					$project: {
						taskDetails: 1,
						totalTaskAssigned: 1,
						totalTaskDone: 1,
						points: {
							$multiply: ['$pointsRatio', 100],
						},
					},
				},
			]);
		return NextResponse.json(aggregatedData);
	}
	if (searchParams.get('status') == 'current') {
		const aggregatedData: getTaskTrackerResponse[] =
			await TaskTrackerModel.aggregate([
				{
					$match: {
						status: 'current',
					},
				},
				{
					$lookup: {
						from: 'tasks',
						localField: 'task',
						foreignField: '_id',
						pipeline: [
							{
								$project: {
									_id: 1,
									task: 1,
									category: 1,
									done: 1,
									assignedDate: 1,
									completedAt: 1,
								},
							},
						],
						as: 'taskDetails',
					},
				},
				{
					$addFields: {
						taskDetails: {
							$first: '$taskDetails',
						},
					},
				},
				{
					$group: {
						_id: '$status',
						taskDetails: {
							$addToSet: '$taskDetails',
						},
						totalTaskAssigned: {
							$count: {},
						},
					},
				},
				{
					$addFields: {
						totalTaskDone: {
							$size: {
								$filter: {
									input: '$taskDetails',
									as: 'task',
									cond: '$$task.done',
								},
							},
						},
					},
				},
				{
					$addFields: {
						pointsRatio: {
							$divide: ['$totalTaskDone', '$totalTaskAssigned'],
						},
					},
				},
				{
					$project: {
						taskDetails: 1,
						totalTaskAssigned: 1,
						totalTaskDone: 1,
						points: {
							$multiply: ['$pointsRatio', 100],
						},
					},
				},
			]);
		return NextResponse.json(aggregatedData[0]);
	}
	const aggregatedData: getTaskTrackerResponse[] =
		await TaskTrackerModel.aggregate([
			{
				$lookup: {
					from: 'tasks',
					localField: 'task',
					foreignField: '_id',
					pipeline: [
						{
							$project: {
								_id: 1,
								task: 1,
								category: 1,
								done: 1,
								assignedDate: 1,
								completedAt: 1,
							},
						},
					],
					as: 'taskDetails',
				},
			},
			{
				$addFields: {
					taskDetails: {
						$first: '$taskDetails',
					},
				},
			},
			{
				$group: {
					_id: {
						$dateToString: {
							format: '%Y-%m-%d',
							date: '$date',
						},
					},
					taskDetails: {
						$addToSet: '$taskDetails',
					},
					totalTaskAssigned: {
						$count: {},
					},
				},
			},
			{
				$addFields: {
					totalTaskDone: {
						$size: {
							$filter: {
								input: '$taskDetails',
								as: 'task',
								cond: '$$task.done',
							},
						},
					},
				},
			},
			{
				$addFields: {
					pointsRatio: {
						$divide: ['$totalTaskDone', '$totalTaskAssigned'],
					},
				},
			},
			{
				$project: {
					taskDetails: 1,
					totalTaskAssigned: 1,
					totalTaskDone: 1,
					points: {
						$multiply: ['$pointsRatio', 100],
					},
				},
			},
		]);
	return NextResponse.json(aggregatedData);
}

export async function DELETE(request: Request) {
	await dbConn(); // Connect to the database
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');
	const deletedTask = await TaskTrackerModel.findByIdAndDelete(id);
	if (!deletedTask)
		return NextResponse.json({ message: 'Task not found' }, { status: 404 });
	return NextResponse.json({
		message: 'Task deleted successfully',
	});
}
