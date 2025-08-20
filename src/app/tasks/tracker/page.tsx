'use client';
import { Progress } from '@/components/ui/progress';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { getTaskTrackerResponse } from '@/types/res/GetResponse.types';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function page() {
	const [trackerData, setTrackerData] = useState<getTaskTrackerResponse[]>([
		{
			_id: 'Loading...',
			totalTaskAssigned: 0,
			totalTaskDone: 0,
			points: 0,
		},
	]);

	useEffect(() => {
		axios
			.get('/api/tasks/tracker?status=past')
			.then((res) => setTrackerData(res.data));
	}, []);

	return (
		<div className='flex items-center justify-center w-full h-[90%] overflow-y-scroll'>
			<Table className='w-11/12 mx-auto'>
				<TableCaption>Day-wise Progress</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className='w-[100px]'>Date</TableHead>
						<TableHead>Total Tasks Assigned</TableHead>
						<TableHead>Total Tasks Done</TableHead>
						<TableHead className='text-right'>Points</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{trackerData.map((data) => (
						<TableRow key={data._id}>
							<TableCell className='font-medium'>{data._id}</TableCell>
							<TableCell>{data.totalTaskAssigned}</TableCell>
							<TableCell>{data.totalTaskDone}</TableCell>
							<TableCell className='text-right flex items-center gap-2'>
								{Math.round(data.points)}
								<Progress value={data.points} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
