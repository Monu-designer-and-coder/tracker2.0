// src/app/api/chapters/route.ts

import { NextResponse } from 'next/server';
import ChapterModel, { ChapterModelInterface } from '@/model/chapter.model';
import SubjectModel from '@/model/subject.model';
import dbConn from '@/lib/dbConn';
import { chapterValidationSchemaBackend } from '@/schema/chapter.schema';
import {
	getChapterResponse,
	getSubjectWiseChapterResponse,
} from '@/types/res/GetResponse.types';

/**
 * ! Create a new chapter
 * @route POST /api/chapters
 * @desc Validates input using Zod, inserts new chapter into DB
 */
export async function POST(request: Request) {
	await dbConn();

	const requestBody = await request.json();

	// * Validate request body using Zod
	const validationResult =
		chapterValidationSchemaBackend.safeParse(requestBody);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json(
			{ errors: validationResult.error.format() },
			{ status: 400 },
		);
	}

	// * Insert chapter into MongoDB
	const newChapter = await ChapterModel.create(requestBody);

	return NextResponse.json<ChapterModelInterface>(newChapter, { status: 201 });
}

/**
 * ! Retrieve chapter(s)
 * @route GET /api/chapters
 * @query id?: string, type?: "all" | "subjectWise"
 * @desc Fetches chapters by ID, or aggregated chapter data
 */
export async function GET(request: Request) {
	await dbConn();

	const { searchParams } = new URL(request.url);
	const chapterId = searchParams.get('id');
	const fetchType = searchParams.get('type');

	// * CASE 1: Fetch all chapters with subject info
	if (!chapterId && fetchType === 'all') {
		const chaptersWithSubject: getChapterResponse[] =
			await ChapterModel.aggregate([
				{
					$lookup: {
						from: 'subjects',
						localField: 'subject',
						foreignField: '_id',
						pipeline: [{ $project: { _id: 1, name: 1, standard: 1 } }],
						as: 'subjectDetails',
					},
				},
				{ $addFields: { subjectDetails: { $first: '$subjectDetails' } } },
				{ $sort: { subject: 1, seqNumber: 1 } },
				{
					$project: {
						_id: 1,
						name: 1,
						subject: '$subjectDetails',
						seqNumber: 1,
						done: 1,
						selectionDiary: 1,
						onePager: 1,
						DPP: 1,
						Module: 1,
						PYQ: 1,
						ExtraMaterial: 1,
					},
				},
			]);
		return NextResponse.json(chaptersWithSubject);
	}

	// * CASE 2: Fetch chapters grouped by subject
	if (!chapterId && fetchType === 'subjectWise') {
		const subjectWiseChapters: getSubjectWiseChapterResponse[] =
			await SubjectModel.aggregate([
				{
					$lookup: {
						from: 'chapters',
						localField: '_id',
						foreignField: 'subject',
						as: 'chapterList',
						pipeline: [
							{
								$project: {
									_id: 1,
									name: 1,
									seqNumber: 1,
									done: 1,
									selectionDiary: 1,
									onePager: 1,
									DPP: 1,
									Module: 1,
									PYQ: 1,
									ExtraMaterial: 1,
								},
							},
						],
					},
				},
				{
					$project: {
						_id: 1,
						name: 1,
						standard: 1,
						chapterList: 1,
					},
				},
			]);
		return NextResponse.json(subjectWiseChapters);
	}

	// * CASE 3: Fetch chapter by ID
	if (chapterId) {
		const chapterById = await ChapterModel.findById(chapterId);
		if (!chapterById) {
			return NextResponse.json(
				{ message: 'Chapter not found' },
				{ status: 404 },
			);
		}
		return NextResponse.json<ChapterModelInterface>(chapterById);
	}

	// ! Default: Bad request if neither type nor ID provided
	return NextResponse.json(
		{ message: 'Invalid request parameters' },
		{ status: 400 },
	);
}

/**
 * ! Update an existing chapter
 * @route PUT /api/chapters
 * @desc Updates chapter by ID
 */
export async function PUT(request: Request) {
	await dbConn();

	const { id, data: updatedData } = await request.json();

	const updatedChapter = await ChapterModel.findByIdAndUpdate(id, updatedData, {
		new: true,
	});

	if (!updatedChapter) {
		return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
	}

	return NextResponse.json<ChapterModelInterface>(updatedChapter);
}

/**
 * ! Delete a chapter
 * @route DELETE /api/chapters
 * @query id: string
 * @desc Deletes chapter by ID
 */
export async function DELETE(request: Request) {
	await dbConn();

	const { searchParams } = new URL(request.url);
	const chapterId = searchParams.get('id');

	const deletedChapter = await ChapterModel.findByIdAndDelete(chapterId);

	if (!deletedChapter) {
		return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
	}

	return NextResponse.json({ message: 'Chapter deleted successfully' });
}
 
// ! IMPROVEMENTS IMPLEMENTED:
//  * 1. Renamed variables for better semantic clarity (e.g., body → requestBody, id → chapterId).
//  * 2. Applied consistent error handling and return formats.
//  * 3. Centralized dbConn call at start of each handler for predictability.
//  * 4. Added clear JSDoc + Better Comments annotations for maintainers.
//  * 5. Reduced redundant condition checks and improved branching.
//  * 6. Used .create() instead of new + save() for brevity in POST.
 
// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
//  * 1. Aggregation pipelines use $project early to minimize data payload.
//  * 2. $first used to flatten joined subjectDetails, reducing iteration overhead.
//  * 3. Index-friendly query patterns preserved (findById, findByIdAndUpdate).
//  * 4. MongoDB pipeline stages ordered for optimal execution.

 // ! FUTURE IMPROVEMENTS:
//  TODO: Add authentication & role-based access control for all endpoints.
//  TODO: Implement server-side caching for 'all' and 'subjectWise' fetch types.
//  TODO: Add pagination to GET responses to handle large datasets efficiently.
//  TODO: Move aggregation pipelines to service layer for cleaner route handlers.

