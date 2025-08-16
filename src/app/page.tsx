'use client';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import React, { useCallback, useEffect, useState } from 'react';

const page = () => {
	// State to hold the target time
	const targetTime = new Date('November 31, 2025 00:00:00');
	const startTime = new Date('May 27, 2024 00:00:00');

	const [date, setDate] = React.useState<Date | undefined>(new Date());
	// State to hold the progress value
	const [timeLeftPercentValue, setTimeLeftPercentValue] = useState<number>(0);

	// State to hold the time left in milliseconds
	const [timeLeft, setTimeLeft] = useState<number>(targetTime.getTime());

	// State to hold the detailed breakdown of time left
	const [timeLeftDetails, setTimeLeftDetails] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});
	const [clockTimeDetails, setClockTimeDetails] = useState({
		date: '',
		hours: 0,
		minutes: 0,
		seconds: 0,
	});
	// Memoized function to calculate the remaining time
	const calculateTimeLeft = useCallback(() => {
		const now = new Date().getTime();
		const difference = targetTime.getTime() - now;
		return difference > 0 ? difference : 0;
	}, [targetTime]);

	useEffect(() => {
		// Function to update the time left
		const updateTimer = () => {
			setTimeLeft(calculateTimeLeft());
		};

		// Set interval to update the timer every second
		const intervalId = setInterval(updateTimer, 100);

		// Cleanup interval on component unmount
		return () => clearInterval(intervalId);
	}, [calculateTimeLeft]);

	useEffect(() => {
		// Update the detailed breakdown of time left
		setTimeLeftDetails({
			days: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
			hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
			minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
			seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
		});
		const CurTimeDateObj = new Date();
		const curTime = {
			date: `${CurTimeDateObj.getDate()}/${
				CurTimeDateObj.getMonth() + 1
			}/${CurTimeDateObj.getFullYear()}`,
			hours: CurTimeDateObj.getHours(),
			minutes: CurTimeDateObj.getMinutes(),
			seconds: CurTimeDateObj.getSeconds(),
		};
		setClockTimeDetails(curTime);
	}, [timeLeft]);
	useEffect(() => {
		//displays the time passed.
		(function () {
			const now = new Date().getTime();
			const start = startTime.getTime();
			const end = targetTime.getTime();

			const totalTime: number = end - start;
			const timeLeft = end - now;

			if (timeLeft <= 0) {
				setTimeLeftPercentValue(0); // Time period has ended
			}

			const percentageLeft = (timeLeft / totalTime) * 100;

			setTimeLeftPercentValue(percentageLeft);
		})();
	}, []);
	return (
		<div className='w-full h-full flex justify-start flex-col items-center py-5'>
			<section className='w-11/12 h-1/5 flex items-center justify-center gap-5 relative'>
				<div className='border border-black relative dark:border-white rounded-4xl w-1/5 h-4/5 flex items-center justify-center text-7xl text-rose-950 dark:text-rose-100 '>
					<Badge
						variant='destructive'
						className='text-xl absolute -top-1.5 -left-1.5 rounded-full'>
						Days
					</Badge>
					{timeLeftDetails.days}
				</div>
				<div className='border border-black relative dark:border-white rounded-4xl w-1/5 h-4/5 flex items-center justify-center text-7xl text-rose-950 dark:text-rose-100 '>
					<Badge
						variant='destructive'
						className='text-xl absolute -top-1.5 -left-1.5 rounded-full'>
						Hours
					</Badge>
					{timeLeftDetails.hours}
				</div>
				<div className='border border-black relative dark:border-white rounded-4xl w-1/5 h-4/5 flex items-center justify-center text-7xl text-rose-950 dark:text-rose-100 '>
					<Badge
						variant='destructive'
						className='text-xl absolute -top-1.5 -left-1.5 rounded-full'>
						Minutes
					</Badge>
					{timeLeftDetails.minutes}
				</div>
				<div className='border border-black relative dark:border-white rounded-4xl w-1/5 h-4/5 flex items-center justify-center text-7xl text-rose-950 dark:text-rose-100 '>
					<Badge
						variant='destructive'
						className='text-xl absolute -top-1.5 -left-1.5 rounded-full'>
						Seconds
					</Badge>
					{timeLeftDetails.seconds}
				</div>
				<Badge
					variant='outline'
					className='text-xl absolute top-1/2 -translate-y-1/2 -right-1.5 rounded-full'>
					Left
				</Badge>
				<Progress
					value={100 - timeLeftPercentValue}
					className='absolute bottom-0'
				/>
			</section>
			<section className='w-11/12 h-4/5 flex items-center justify-center gap-5 relative'>
				<div className='w-5/7 h-full flex flex-col items-center justify-center'></div>
				<div className='w-2/7 h-full flex flex-col items-center justify-center'>
					<div className='flex items-center justify-center w-full '>
						<div className='border border-black relative dark:border-white rounded-4xl w-1/3 h-4/5 flex items-center justify-center text-4xl text-rose-950 dark:text-rose-100 '>
							{clockTimeDetails.hours}
						</div>
						<div className='border border-black relative dark:border-white rounded-4xl w-1/3 h-4/5 flex items-center justify-center text-4xl text-rose-950 dark:text-rose-100 '>
							{clockTimeDetails.minutes}
						</div>
						<div className='border border-black relative dark:border-white rounded-4xl w-1/3 h-4/5 flex items-center justify-center text-4xl text-rose-950 dark:text-rose-100 '>
							{clockTimeDetails.seconds}
						</div>
					</div>
					<Calendar
						mode='single'
						defaultMonth={date}
						selected={date}
						onSelect={setDate}
						className='rounded-lg border'
					/>
				</div>
			</section>
		</div>
	);
};

export default page;
