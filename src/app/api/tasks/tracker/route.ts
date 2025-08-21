// ! API ROUTE HANDLER
// ? This file defines the API endpoints for managing task tracker data.

import dbConn from '@/lib/dbConn';
import TaskTrackerModel, {
	TaskTrackerModelInterface,
} from '@/model/task-tracker.model';
import { TaskTrackerPUTSchema, TaskTrackerSchema } from '@/schema/tasks.schema';
import {
	getTaskTrackerResponse,
	getWeeklyTaskTrackerResponse,
} from '@/types/res/GetResponse.types';
import { NextResponse } from 'next/server';

/**
 * * POST: Create a new task tracker entry
 * @returns NextResponse with the newly created task or an error.
 */
export async function POST(request: Request) {
	// ? Connect to the database before processing the request.
	await dbConn();

	try {
		// * Parse the incoming request body and validate it with Zod.
		const requestBody = await request.json();
		const validatedData = TaskTrackerSchema.safeParse({
			...requestBody,
			date: new Date(requestBody.date),
		});

		// ! If validation fails, return a 400 Bad Request error.
		if (!validatedData.success) {
			return NextResponse.json(
				{
					errors: validatedData.error.flatten().fieldErrors,
					message: 'Validation failed.',
				},
				{ status: 400 },
			);
		}

		// * Create and save the new task tracker document in one operation.
		const createdTask = await TaskTrackerModel.create(validatedData.data);

		// ? Return a 201 Created response with the new document.
		return NextResponse.json<TaskTrackerModelInterface>(createdTask, {
			status: 201,
		});
	} catch (error) {
		// ! Handle internal server errors.
		console.error('Error creating task tracker entry:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

/**
 * * PUT: Update an existing task tracker entry by ID
 * @returns NextResponse with the updated task or an error.
 */
export async function PUT(request: Request) {
	// ? Connect to the database before processing the request.
	await dbConn();

	try {
		// * Parse and validate the request body.
		const requestBody = await request.json();
		const validatedBody = TaskTrackerPUTSchema.safeParse(requestBody);

		// ! If validation fails, return a 400 Bad Request error.
		if (!validatedBody.success) {
			return NextResponse.json(
				{
					errors: validatedBody.error.flatten().fieldErrors,
					message: 'Validation failed.',
				},
				{ status: 400 },
			);
		}

		// * Find and update the task document in a single, atomic operation.
		const updatedTask = await TaskTrackerModel.findByIdAndUpdate(
			validatedBody.data.id,
			validatedBody.data.data,
			{ new: true }, // ? Return the updated document instead of the old one.
		);

		// ! If the task is not found, return a 404 Not Found error.
		if (!updatedTask) {
			return NextResponse.json({ message: 'Task not found' }, { status: 404 });
		}

		// ? Return a 200 OK response with the updated document.
		return NextResponse.json(updatedTask, {
			status: 200,
		});
	} catch (error) {
		// ! Handle internal server errors.
		console.error('Error updating task tracker entry:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

/**
 * * GET: Retrieve task tracker data
 * ? Supports filtering by status ('current', 'past', 'weekly')
 * @returns NextResponse with the aggregated task data or an error.
 */
export async function GET(request: Request) {
	// ? Connect to the database before processing the request.
	await dbConn();
	const { searchParams } = new URL(request.url);
	const status = searchParams.get('status');

	// * Define the base aggregation pipeline stages that are common to all requests.
	const commonPipeline = [
		// * Lookup the full task details from the 'tasks' collection.
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
		// * Unwind the taskDetails array and promote the first element to the root.
		{
			$addFields: {
				taskDetails: { $first: '$taskDetails' },
			},
		},
	];

	// * Conditionally build the pipeline based on the 'status' query parameter.
	let pipeline;
	switch (status) {
		case 'past':
			pipeline = [
				...commonPipeline,
				{ $match: { status: 'past' } },
				{
					$group: {
						_id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
						taskDetails: { $addToSet: '$taskDetails' },
						totalTaskAssigned: { $count: {} },
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
						points: {
							$multiply: [
								{ $divide: ['$totalTaskDone', '$totalTaskAssigned'] },
								100,
							],
						},
					},
				},
				{
					$project: {
						taskDetails: 1,
						totalTaskAssigned: 1,
						totalTaskDone: 1,
						points: 1,
					},
				},
			];
			break;
		case 'weekly':
			pipeline = [
				...commonPipeline,
				{ $match: { status: 'past' } },
				{
					// * First, group by day to get daily stats.
					$group: {
						_id: {
							day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
							week: { $isoWeek: '$date' },
							year: { $isoWeekYear: '$date' },
						},
						taskDetails: { $addToSet: '$taskDetails' },
						totalTaskAssigned: { $count: {} },
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
						points: {
							$multiply: [
								{ $divide: ['$totalTaskDone', '$totalTaskAssigned'] },
								100,
							],
						},
					},
				},
				{
					// * Second, group the daily stats by week.
					$group: {
						_id: { week: '$_id.week', year: '$_id.year' },
						weeklyBreakdown: {
							$push: {
								day: '$_id.day',
								// * Use a switch statement to map day number to day name.
								dayName: {
									$switch: {
										branches: [
											{
												case: {
													$eq: [{ $dayOfWeek: { $toDate: '$_id.day' } }, 1],
												},
												then: 'Sunday',
											},
											{
												case: {
													$eq: [{ $dayOfWeek: { $toDate: '$_id.day' } }, 2],
												},
												then: 'Monday',
											},
											{
												case: {
													$eq: [{ $dayOfWeek: { $toDate: '$_id.day' } }, 3],
												},
												then: 'Tuesday',
											},
											{
												case: {
													$eq: [{ $dayOfWeek: { $toDate: '$_id.day' } }, 4],
												},
												then: 'Wednesday',
											},
											{
												case: {
													$eq: [{ $dayOfWeek: { $toDate: '$_id.day' } }, 5],
												},
												then: 'Thursday',
											},
											{
												case: {
													$eq: [{ $dayOfWeek: { $toDate: '$_id.day' } }, 6],
												},
												then: 'Friday',
											},
											{
												case: {
													$eq: [{ $dayOfWeek: { $toDate: '$_id.day' } }, 7],
												},
												then: 'Saturday',
											},
										],
										default: 'Unknown',
									},
								},
								taskDetails: '$taskDetails',
								totalTaskAssigned: '$totalTaskAssigned',
								totalTaskDone: '$totalTaskDone',
								points: '$points',
							},
						},
						totalTasksAssignedWeekly: { $sum: '$totalTaskAssigned' },
						totalTasksDoneWeekly: { $sum: '$totalTaskDone' },
					},
				},
				{
					$project: {
						_id: 1,
						weeklyBreakdown: 1,
						totalTasksAssignedWeekly: 1,
						totalTasksDoneWeekly: 1,
						weeklyPoints: {
							$multiply: [
								{
									$divide: [
										'$totalTasksDoneWeekly',
										'$totalTasksAssignedWeekly',
									],
								},
								100,
							],
						},
					},
				},
			];
			break;
		case 'current':
			pipeline = [
				...commonPipeline,
				{ $match: { status: 'current' } },
				{
					$group: {
						_id: '$status',
						taskDetails: { $addToSet: '$taskDetails' },
						totalTaskAssigned: { $count: {} },
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
						points: {
							$multiply: [
								{ $divide: ['$totalTaskDone', '$totalTaskAssigned'] },
								100,
							],
						},
					},
				},
				{
					$project: {
						taskDetails: 1,
						totalTaskAssigned: 1,
						totalTaskDone: 1,
						points: 1,
					},
				},
			];
			break;
		default:
			pipeline = [
				...commonPipeline,
				{
					$group: {
						_id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
						taskDetails: { $addToSet: '$taskDetails' },
						totalTaskAssigned: { $count: {} },
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
						points: {
							$multiply: [
								{ $divide: ['$totalTaskDone', '$totalTaskAssigned'] },
								100,
							],
						},
					},
				},
				{
					$project: {
						taskDetails: 1,
						totalTaskAssigned: 1,
						totalTaskDone: 1,
						points: 1,
					},
				},
			];
			break;
	}

	try {
		const results = await TaskTrackerModel.aggregate(pipeline);

		// ? Special handling for 'current' status, which should return a single object.
		if (status === 'current') {
			return NextResponse.json(results[0] || null);
		}

		// ? Return the results for all other statuses.
		return NextResponse.json(results);
	} catch (error) {
		// ! Handle internal server errors.
		console.error('Error aggregating task tracker data:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

/**
 * * DELETE: Delete a task tracker entry by ID
 * @returns NextResponse with a success message or an error.
 */
export async function DELETE(request: Request) {
	// ? Connect to the database before processing the request.
	await dbConn();

	try {
		// * Extract the ID from the search parameters.
		const { searchParams } = new URL(request.url);
		const taskId = searchParams.get('id');

		// ! If no ID is provided, return a 400 Bad Request error.
		if (!taskId) {
			return NextResponse.json(
				{ message: 'Task ID is required' },
				{ status: 400 },
			);
		}

		// * Find and delete the task document in a single, efficient operation.
		const deletedTask = await TaskTrackerModel.findByIdAndDelete(taskId);

		// ! If the task is not found, return a 404 Not Found error.
		if (!deletedTask) {
			return NextResponse.json({ message: 'Task not found' }, { status: 404 });
		}

		// ? Return a 200 OK response with a success message.
		return NextResponse.json({ message: 'Task deleted successfully' });
	} catch (error) {
		// ! Handle internal server errors.
		console.error('Error deleting task tracker entry:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Monolithic GET Endpoint Refactor: Replaced separate GET blocks with a single, conditional aggregation pipeline, reducing code duplication.
// * 2. Optimized Database Operations: Switched from `new Model().save()` to `Model.create()` and used `findByIdAndDelete` for efficiency.
// * 3. Improved Error Handling: Zod validation errors now use `flatten().fieldErrors` for a more structured response.
// * 4. Enhanced Variable Naming: Replaced generic names with more descriptive ones.
// * 5. New Functionality: Added a new `GET` endpoint for `status=weekly` with a detailed daily breakdown.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Single DB Connection: The `dbConn()` function efficiently checks for an existing connection.
// * 2. Parallel API Calls: The code structure is designed for asynchronous processing.
// * 3. Optimized MongoDB Aggregation: All data transformations are performed on the server-side, minimizing data transfer.

// ! FUTURE IMPROVEMENTS:
// TODO: Implement a unified and reusable aggregation function to further abstract the pipeline logic.
// TODO: Add caching mechanisms (e.g., Redis) for frequently requested GET endpoints to reduce database load.
// TODO: Introduce request throttling to prevent API abuse.
// TODO: Secure endpoints with authentication to ensure only authorized users can create, update, or delete tasks.
// TODO: Implement comprehensive unit and integration tests for all API endpoints.
