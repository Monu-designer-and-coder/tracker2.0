// src/app/api/chapters/route.ts
import { NextResponse } from 'next/server';
import ChapterModel, { ChapterModelInterface } from '@/model/chapter.model';
import dbConn from '@/lib/dbConn';
import { chapterValidationSchemaBackend } from '@/schema/chapter.schema';

// Create a new chapter
export async function POST(request: Request) {
	await dbConn(); // Connect to the database
	const body = await request.json();

	// Validate the request body against the Zod schema
	const validationResult = chapterValidationSchemaBackend.safeParse(body);
	if (!validationResult.success) {
		// If validation fails, return a 400 response with the validation errors
		return NextResponse.json(
			{ errors: validationResult.error },
			{ status: 400 },
		);
	}

	const chapter = new ChapterModel(body);
	await chapter.save();
	return NextResponse.json<ChapterModelInterface>(chapter, { status: 201 });
}

// Get a single chapter by ID
export async function GET(request: Request) {
	await dbConn(); // Connect to the database
	const { searchParams } = new URL(request.url);
	// Get all chapters
	if (!searchParams.get('id')) {
		const aggregatedData = await ChapterModel.aggregate([
			{
				$lookup: {
					from: 'subjects',
					localField: 'subject',
					foreignField: '_id',
					pipeline: [
						{
							$project: {
								_id: 1,
								name: 1,
								standard: 1,
							},
						},
					],
					as: 'subjectDetails',
				},
			},
			{
				$addFields: {
					subjectDetails: {
						$first: '$subjectDetails',
					},
				},
			},
		]);
		return NextResponse.json(aggregatedData);
	}
	const id = searchParams.get('id');
	const chapter = await ChapterModel.findById(id);
	if (!chapter)
		return NextResponse.json({ message: 'chapter not found' }, { status: 404 });
	return NextResponse.json<ChapterModelInterface>(chapter);
}

// Update a chapter by ID
export async function PUT(request: Request) {
	await dbConn(); // Connect to the database
	const body = await request.json();
	const { id } = body;
	const updatedChapter = await ChapterModel.findByIdAndUpdate(id, body.data, {
		new: true,
	});
	if (!updatedChapter)
		return NextResponse.json({ message: 'chapter not found' }, { status: 404 });
	return NextResponse.json<ChapterModelInterface>(updatedChapter);
}

// Delete a chapter by ID
export async function DELETE(request: Request) {
	await dbConn(); // Connect to the database
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');
	const deletedChapter = await ChapterModel.findByIdAndDelete(id);
	if (!deletedChapter)
		return NextResponse.json({ message: 'chapter not found' }, { status: 404 });
	return NextResponse.json({
		message: 'chapter deleted successfully',
	});
}
