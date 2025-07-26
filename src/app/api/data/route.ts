import dbConn from '@/lib/dbConn';
import ChapterModel from '@/model/chapter.model';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	await dbConn();
	const aggregatedData = await ChapterModel.aggregate([
		{
			$lookup: {
				from: 'topics',
				localField: '_id',
				foreignField: 'chapter',
				as: 'topics',
			},
		},
		{
			$addFields: {
				topics: {
					$map: {
						input: '$topics',
						as: 'topic',
						in: {
							_id: '$$topic._id',
							name: '$$topic.name',
						},
					},
				},
			},
		},
		{
			$lookup: {
				from: 'subjects',
				localField: 'subject',
				foreignField: '_id',
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
			$group: {
				_id: '$subject',
				name: {
					$push: '$subjectDetails.name',
				},
				standard: {
					$push: '$subjectDetails.standard',
				},
				chapters: {
					$push: {
						_id: '$_id',
						name: '$name',
						seqNumber: '$seqNumber',
						done: '$done',
						selectionDiary: '$selectionDiary',
						topics: '$topics',
					},
				},
			},
		},
		{
			$project: {
				name: {
					$first: '$name',
				},
				standard: {
					$first: '$standard',
				},
				chapters: 1,
			},
		},
	]);
	return NextResponse.json(aggregatedData);
}
