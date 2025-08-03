// src/app/api/chapters/route.ts
import { NextResponse } from 'next/server';
import ChapterModel, { ChapterModelInterface } from '@/model/chapter.model';
import dbConn from '@/lib/dbConn';
import { chapterValidationSchemaBackend } from '@/schema/chapter.schema';
import {
	getChapterResponse,
	getSubjectWiseChapterResponse,
} from '@/types/res/GetResponse.types';
import SubjectModel from '@/model/subject.model';

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
		if (searchParams.get('type') == 'all') {
			const aggregatedData: getChapterResponse[] = await ChapterModel.aggregate(
				[
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
					{
						$sort: {
							subject: 1,
							seqNumber: 1,
						},
					},
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
				],
			);
			return NextResponse.json(aggregatedData);
		}
		if (searchParams.get('type') == 'subjectWise') {
			const aggregatedData: getSubjectWiseChapterResponse[] =
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
			return NextResponse.json(aggregatedData);
		}
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
