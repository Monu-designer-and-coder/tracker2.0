// src/app/api/data/route.ts

import { NextResponse } from 'next/server';
import dbConn from '@/lib/dbConn';
import ChapterModel from '@/model/chapter.model';

/**
 * ! Aggregated Data Endpoint
 * @route GET /api/data
 * @desc Returns nested structure:
 *       Subject → Chapters → Topics
 *       with all relevant metadata for app compatibility
 */
export async function GET(request: Request) {
	await dbConn();

	const aggregatedData = await ChapterModel.aggregate([
		// * Join topics for each chapter
		{
			$lookup: {
				from: 'topics',
				localField: '_id',
				foreignField: 'chapter',
				as: 'topics',
				pipeline: [
					{
						$project: {
							_id: 1,
							name: 1,
							seqNumber: 1,
							done: 1,
							boards: 1,
							mains: 1,
							advanced: 1,
						},
					},
					{ $sort: { seqNumber: 1 } },
				],
			},
		},

		// * Join subject details for each chapter
		{
			$lookup: {
				from: 'subjects',
				localField: 'subject',
				foreignField: '_id',
				as: 'subjectDetails',
				pipeline: [{ $project: { _id: 1, name: 1, standard: 1 } }],
			},
		},

		// * Flatten subjectDetails array to single object
		{
			$addFields: {
				subjectDetails: { $first: '$subjectDetails' },
			},
		},

		// * Group chapters under their subject
		{
			$group: {
				_id: '$subject',
				subjectName: { $first: '$subjectDetails.name' },
				standard: { $first: '$subjectDetails.standard' },
				chapters: {
					$push: {
						_id: '$_id',
						name: '$name',
						seqNumber: '$seqNumber',
						done: '$done',
						selectionDiary: '$selectionDiary',
						onePager: '$onePager',
						DPP: '$DPP',
						Module: '$Module',
						PYQ: '$PYQ',
						ExtraMaterial: '$ExtraMaterial',
						topics: '$topics',
					},
				},
			},
		},

		// * Final projection for clean response shape
		{
			$project: {
				_id: 0,
				subjectId: '$_id',
				name: '$subjectName',
				standard: 1,
				chapters: 1,
			},
		},

		// * Sort by standard then name for predictable UI order
		{
			$sort: { standard: 1, name: 1 },
		},
	]);

	return NextResponse.json(aggregatedData);
}

/*  
 ! IMPROVEMENTS IMPLEMENTED:
 * 1. Fixed subject name/standard handling using $first directly in $group to avoid nested arrays.
 * 2. Added projection of all chapter fields required by latest frontend (booleans, sequence).
 * 3. Sorted topics by seqNumber to maintain intended learning flow.
 * 4. Unified field names with other API endpoints for seamless integration.
 * 5. Added final $sort for consistent subject order in UI.
 * 6. Added Better Comments + JSDoc for maintainability.

  ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
 * 1. $project and $sort used inside $lookup pipelines to reduce data transfer.
 * 2. $first in $group avoids unnecessary array memory usage.
 * 3. Only necessary fields selected at each pipeline stage.

  ! FUTURE IMPROVEMENTS:
 * TODO: Add caching for aggregated data (e.g., Redis) for faster repeated access.
 * TODO: Allow optional query params to filter by subject or standard.
 * TODO: Paginate topics if chapters have large topic lists.
*/
