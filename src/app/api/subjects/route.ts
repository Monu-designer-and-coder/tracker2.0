// src/app/api/subjects/route.ts
import { NextResponse } from 'next/server';
import SubjectModel from '@/model/subject.model'; // Adjust the import path as necessary
import dbConn from '@/lib/dbConn';
import { subjectValidationSchema } from '@/schema/subject.schema';
import { getSubjectResponse } from '@/types/res/GetResponse.types';

// Create a new subject
export async function POST(request: Request) {
	await dbConn(); // Connect to the database
	const body = await request.json();

	// Validate the request body against the Zod schema
	const validationResult = subjectValidationSchema.safeParse(body);
	if (!validationResult.success) {
		// If validation fails, return a 400 response with the validation errors
		return NextResponse.json({ errors: validationResult }, { status: 400 });
	}

	const subject = new SubjectModel(body);
	await subject.save();
	return NextResponse.json(subject, { status: 201 });
}

// Get a single subject by ID
export async function GET(request: Request) {
	await dbConn(); // Connect to the database
	const { searchParams } = new URL(request.url);
	// Get all subjects
	if (!searchParams.get('id')) {
		/*const aggregatedData = await SubjectModel.aggregate([
			// 1. Look up the chapters that belong to this subject,
			//    project only the necessary fields, and sort by seqNumber.
			{
				$lookup: {
					from: 'chapters',
					let: { subjectId: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$eq: ['$subject', '$$subjectId'],
								},
							},
						},
						{
							$project: {
								_id: 1,
								name: 1,
								seqNumber: 1,
								done: 1,
								selectionDiary: 1,
							},
						},
						{ $sort: { seqNumber: 1 } },
					],
					as: 'chapters',
				},
			},
			// 2. Compute the completed chapters lists and counts.
			{
				$set: {
					completedChapters: {
						$filter: {
							input: '$chapters',
							as: 'chapter',
							cond: '$$chapter.done',
						},
					},
					completedSelectionDiaryChapters: {
						$filter: {
							input: '$chapters',
							as: 'chapter',
							cond: '$$chapter.selectionDiary',
						},
					},
					totalChapters: { $size: '$chapters' },
				},
			},
			// 3. Compute count fields for the filtered arrays.
			{
				$set: {
					totalCompletedChapters: {
						$size: '$completedChapters',
					},
					totalCompletedSelectionDiaryChapters: {
						$size: '$completedSelectionDiaryChapters',
					},
				},
			},
			// 4. Determine the previous chapter.
			{
				$set: {
					prevChapter: {
						$cond: {
							if: {
								$eq: ['$totalCompletedChapters', 0],
							},
							then: { seqNumber: 0 },
							else: { $last: '$completedChapters' },
						},
					},
				},
			},
			// 5. Determine the current chapter.
			{
				$set: {
					currChapter: {
						$cond: {
							if: {
								$eq: ['$prevChapter.seqNumber', '$totalChapters'],
							},
							then: { $last: '$chapters' },
							else: {
								$arrayElemAt: ['$chapters', '$prevChapter.seqNumber'],
							},
						},
					},
				},
			},
			// 6. Compute the percentage completed values.
			{
				$set: {
					percentCompleted: {
						$multiply: [
							{
								$divide: ['$totalCompletedChapters', '$totalChapters'],
							},
							100,
						],
					},
					percentSelectionDiaryCompleted: {
						$multiply: [
							{
								$divide: [
									'$totalCompletedSelectionDiaryChapters',
									'$totalChapters',
								],
							},
							100,
						],
					},
				},
			},
			{
				$lookup: {
					from: 'topics',
					let: { chapterID: '$currChapter._id' },
					pipeline: [
						{
							$match: {
								$expr: {
									$eq: ['$chapter', '$$chapterID'],
								},
							},
						},
						{
							$project: {
								_id: 1,
								name: 1,
								seqNumber: 1,
								done: 1,
							},
						},
						{ $sort: { name: 1 } },
					],
					as: 'currChapterTopics',
				},
			},
			// 7. Finally, project the required fields.
			{
				$project: {
					_id: 1,
					name: 1,
					standard: 1,
					chapters: 1,
					currChapter: 1,
					prevChapter: 1,
					completedChapters: 1,
					completedSelectionDiaryChapters: 1,
					totalCompletedChapters: 1,
					totalCompletedSelectionDiaryChapters: 1,
					totalChapters: 1,
					percentCompleted: 1,
					currChapterTopics: 1,
					percentSelectionDiaryCompleted: 1,
				},
			},
		]);
		*/

		const responseData: getSubjectResponse[] = await SubjectModel.aggregate([
			{
				$sort: {
					standard: 1,
				},
			},
			{
				$project: {
					_id: 1,
					name: 1,
					standard: 1,
				},
			},
		]);

		return NextResponse.json(responseData);
	}
	const id = searchParams.get('id');
	const subject = await SubjectModel.findById(id);
	if (!subject)
		return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
	return NextResponse.json(subject);
}

// Update a subject by ID
export async function PUT(request: Request) {
	await dbConn(); // Connect to the database
	const body = await request.json();
	const { id } = body;
	const updatedSubject = await SubjectModel.findByIdAndUpdate(id, body.data, {
		new: true,
	});
	if (!updatedSubject)
		return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
	return NextResponse.json(updatedSubject);
}

// Delete a subject by ID
export async function DELETE(request: Request) {
	await dbConn(); // Connect to the database
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');
	const deletedSubject = await SubjectModel.findByIdAndDelete(id);
	if (!deletedSubject)
		return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
	return NextResponse.json({ message: 'Subject deleted successfully' });
}
