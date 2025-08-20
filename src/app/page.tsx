'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getTaskTrackerResponse } from '@/types/res/GetResponse.types';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CheckSquare, XSquare } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const page = () => {
	// Define a type for a todo item for clarity
	interface Todo {
		id: string;
		text: string;
		completed: boolean;
	}

	const [todos, setTodos] = useState<Todo[]>([]);
	const [todaysPoints, setTodaysPoints] = useState<number>(0);

	// Memoized sorted todos: incomplete first, then completed (with completed at the very bottom)
	const sortedTodos = useMemo(() => {
		// Separate active and completed todos
		const activeTodos = todos.filter((todo) => !todo.completed);
		const completedTodos = todos.filter((todo) => todo.completed);

		// Sort active todos by their original order (or creation time if no other sort is specified)
		// For simplicity, we'll assume they maintain their order when added if not completed.
		// If you wanted to sort them alphabetically, you would add that here.

		return [...activeTodos, ...completedTodos];
	}, [todos]);
	// State to hold the target time
	const targetTime = new Date('November 31, 2025 00:00:00');
	const startTime = new Date('May 27, 2024 00:00:00');

	const [date, setDate] = React.useState<Date | undefined>(new Date());
	// State to hold the progress value
	const [timeLeftPercentValue, setTimeLeftPercentValue] = useState<number>(0);

	// State to hold the time left in milliseconds
	const [timeLeft, setTimeLeft] = useState<number>(targetTime.getTime());

	const toggleTodo = ({
		id,
		completed,
	}: {
		id: string;
		completed: boolean;
	}) => {
		const config: AxiosRequestConfig = {
			method: 'PUT',
			url: '/api/tasks/task',
			data: {
				id,
				data: {
					done: !completed,
				},
			},
		};
		axios.request(config).then(() => {
			axios
				.get('/api/tasks/tracker?status=current')
				.then((response: AxiosResponse<getTaskTrackerResponse>) => {
					if (response.data.taskDetails) {
						setTodos(
							response.data.taskDetails.map((task) => ({
								id: task._id,
								text: task.task,
								completed: task.done,
							})),
						);
					}
					console.log(response.data);
					if (response.data.points){
						setTodaysPoints(response.data.points);
						console.log(todaysPoints);
					}
				});
		});
	};

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
		axios
			.get('/api/tasks/tracker?status=current')
			.then((response: AxiosResponse<getTaskTrackerResponse>) => {
				if (response.data.taskDetails) {
					setTodos(
						response.data.taskDetails.map((task) => ({
							id: task._id,
							text: task.task,
							completed: task.done,
						})),
					);
				}
				if (response.data.points) setTodaysPoints(response.data.points);
			});
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
				<div className='w-5/7 h-full flex flex-col items-center gap-3 justify-center'>
					<Button
						onClick={() => {
							axios
								.request({
									data: {
										type: 'dayPackup',
									},
									method: 'PUT',
									url: '/api/tasks',
								})
								.then(() => {
									axios
										.get('/api/tasks/tracker?status=current')
										.then((response: AxiosResponse<getTaskTrackerResponse>) => {
											if (response.data.taskDetails) {
												setTodos(
													response.data.taskDetails.map((task) => ({
														id: task._id,
														text: task.task,
														completed: task.done,
													})),
												);
											}
											if (response.data.points)
												setTodaysPoints(response.data.points);
										});
								});
						}}>
						Day Packup
					</Button>
					<Progress value={todaysPoints} />
					<div className='space-y-3 overflow-y-scroll h-[80%] w-full'>
						{sortedTodos.length === 0 ? (
							<div className='text-center py-10 text-zinc-500 dark:text-zinc-400'>
								<p className='text-lg font-medium'>No todos yet!</p>
								<p className='text-sm'>Start by adding a task above.</p>
							</div>
						) : (
							sortedTodos.map((todo) => (
								<Card
									key={todo.id}
									className='bg-zinc-50 dark:bg-zinc-700 border border-zinc-100 dark:border-zinc-700 rounded-lg shadow-sm'>
									<CardContent className='flex items-center justify-between p-4'>
										<span
											className={`flex-grow text-lg font-medium ${
												todo.completed
													? 'line-through text-zinc-400 dark:text-zinc-500'
													: 'text-zinc-800 dark:text-zinc-100'
											}`}>
											{todo.text}
										</span>
										<div className='flex space-x-2'>
											{/* Done/Undo Button */}
											<Button
												variant='outline'
												size='icon'
												onClick={() =>
													toggleTodo({ id: todo.id, completed: todo.completed })
												}
												className={`rounded-full transition-all duration-200 ${
													todo.completed
														? 'bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/50 dark:hover:bg-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
														: 'bg-green-100 hover:bg-green-200 text-green-600 dark:bg-green-900/50 dark:hover:bg-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
												}`}
												title={
													todo.completed
														? 'Mark as incomplete'
														: 'Mark as complete'
												}>
												{todo.completed ? (
													<XSquare className='h-5 w-5' />
												) : (
													<CheckSquare className='h-5 w-5' />
												)}
											</Button>
										</div>
									</CardContent>
								</Card>
							))
						)}
					</div>
				</div>
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
