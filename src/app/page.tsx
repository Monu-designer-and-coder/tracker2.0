'use client';

// ! SHADCN UI COMPONENTS IMPORTS
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// ! TYPE DEFINITIONS
import { getTaskTrackerResponse } from '@/types/res/GetResponse.types';

// ! EXTERNAL DEPENDENCIES
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
	CheckSquare,
	XSquare,
	Clock,
	Calendar as CalendarIcon,
	Target,
	TrendingUp,
	Package,
	Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// ! LOCAL TYPE DEFINITIONS
/**
 * * Represents a todo item with enhanced type safety
 * ? Used for internal state management of tasks
 */
interface TodoItem {
	id: string;
	text: string;
	completed: boolean;
}

/**
 * * Time breakdown interface for countdown display
 * ? Provides structured time data for UI components
 */
interface TimeBreakdown {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

/**
 * * Current time details for clock display
 * ? Separates date and time components for better organization
 */
interface ClockTimeDetails {
	date: string;
	hours: number;
	minutes: number;
	seconds: number;
}

// ! CONSTANTS AND CONFIGURATION
/**
 * * Target date for countdown timer
 * TODO: Move to environment variables or config file
 * ? Should be configurable based on user preferences or app settings
 */
const TARGET_DATE = new Date('November 31, 2025 00:00:00');
const START_DATE = new Date('May 27, 2024 00:00:00');

/**
 * * Calculate total days between start and target dates
 * ? Used for progress calculation and display
 */
const TOTAL_DAYS = Math.floor(
	(TARGET_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24),
);

// ! MAIN COMPONENT
/**
 * * HomePage Component - Main dashboard for task tracking and time management
 * ? Displays countdown timer, task list, current time, and calendar
 *
 * Features:
 * - Real-time countdown to target date
 * - Task management with completion tracking
 * - Progress visualization
 * - Current time display
 * - Calendar integration
 *
 * @returns JSX element containing the complete homepage layout
 */
const HomePage: React.FC = () => {
	// ! STATE DECLARATIONS
	/**
	 * * Todo items state management
	 * ? Stores all tasks fetched from API with local TodoItem interface
	 */
	const [todoItems, setTodoItems] = useState<TodoItem[]>([]);

	/**
	 * * Today's points tracking
	 * ? Represents user's progress/score for the current day
	 */
	const [dailyPoints, setDailyPoints] = useState<number>(0);
	/**
	 * * Today's day to packup the day automatically.
	 * ? Represents the date of current day
	 */
	const [currentDateInBackend, setCurrentDateInBackend] = useState<number>(
		new Date().getDate(),
	);

	/**
	 * * Calendar selection state
	 * ? Tracks selected date in the calendar component
	 */
	const [selectedCalendarDate, setSelectedCalendarDate] = useState<
		Date | undefined
	>(new Date());

	/**
	 * * Time left percentage for progress bar
	 * ? Calculated percentage of time remaining between start and target dates
	 */
	const [timeRemainingPercentage, setTimeRemainingPercentage] =
		useState<number>(0);

	/**
	 * * Current countdown time in milliseconds
	 * ? Updated every 100ms for real-time countdown display
	 */
	const [countdownTimeLeft, setCountdownTimeLeft] = useState<number>(
		TARGET_DATE.getTime(),
	);

	/**
	 * * Detailed time breakdown for countdown display
	 * ? Structured object containing days, hours, minutes, seconds
	 */
	const [countdownBreakdown, setCountdownBreakdown] = useState<TimeBreakdown>({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	/**
	 * * Current system time details
	 * ? Used for displaying current date and time in the sidebar
	 */
	const [currentTimeDetails, setCurrentTimeDetails] =
		useState<ClockTimeDetails>({
			date: '',
			hours: 0,
			minutes: 0,
			seconds: 0,
		});

	/**
	 * * Loading states for better UX
	 * ? Tracks loading status for different operations
	 */
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isPackingUp, setIsPackingUp] = useState<boolean>(false);

	// ! MEMOIZED COMPUTATIONS
	/**
	 * * Sorted todo items with incomplete tasks first
	 * ? Optimizes rendering by memoizing the sorted array
	 * * Performance: Only recalculates when todoItems array changes
	 */
	const sortedTodoItems = useMemo(() => {
		const incompleteTasks = todoItems.filter((task) => !task.completed);
		const completedTasks = todoItems.filter((task) => task.completed);

		// * Return incomplete tasks first, then completed tasks
		return [...incompleteTasks, ...completedTasks];
	}, [todoItems]);

	/**
	 * * Calculate completion statistics
	 * ? Provides insights for progress tracking
	 */
	const taskStats = useMemo(() => {
		const total = todoItems.length;
		const completed = todoItems.filter((task) => task.completed).length;
		const completionRate =
			total > 0 ? Math.round((completed / total) * 100) : 0;

		return { total, completed, completionRate, remaining: total - completed };
	}, [todoItems]);

	// ! CALLBACK FUNCTIONS
	/**
	 * * Calculate remaining time until target date
	 * ? Memoized function to prevent unnecessary recalculations
	 * @returns Remaining time in milliseconds (0 if target date has passed)
	 */
	const calculateRemainingTime = useCallback((): number => {
		const currentTime = new Date().getTime();
		const timeDifference = TARGET_DATE.getTime() - currentTime;
		return timeDifference > 0 ? timeDifference : 0;
	}, []);

	/**
	 * * Fetch current task data from API
	 * ? Centralized function to reduce code duplication
	 * * Updates both todo items and daily points
	 */
	const fetchCurrentTaskData = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			const response: AxiosResponse<getTaskTrackerResponse> = await axios.get(
				'/api/tasks/tracker?status=current',
			);

			// ! Check weather the response.data is null or not
			if (response.data === null ) return;

			// * Update todo items if task details exist
			if (response.data.taskDetails) {
				const transformedTasks: TodoItem[] = response.data.taskDetails.map(
					(task) => ({
						id: task._id,
						text: task.task,
						completed: task.done,
					}),
				);
				// * Update running day for automation of the dayPackup.
				setTodoItems(transformedTasks);
				const curDate = new Date(response.data.taskDetails[0].assignedDate);
				setCurrentDateInBackend(curDate.getDate());
			}

			// * Update daily points if available
			if (response.data.points) {
				setDailyPoints(response.data.points);
			}
		} catch (error) {
			console.error('Failed to fetch task data:', error);
			// TODO: Implement proper error handling with toast notifications
		} finally {
			setIsLoading(false);
		}
	}, []);

	/**
	 * * Toggle task completion status
	 * ? Handles both API update and local state refresh
	 *
	 * @param taskId - Unique identifier of the task
	 * @param isCurrentlyCompleted - Current completion status
	 */
	const toggleTaskCompletion = useCallback(
		async ({
			taskId,
			isCurrentlyCompleted,
		}: {
			taskId: string;
			isCurrentlyCompleted: boolean;
		}): Promise<void> => {
			try {
				const updateConfig: AxiosRequestConfig = {
					method: 'PUT',
					url: '/api/tasks/task',
					data: {
						id: taskId,
						data: {
							done: !isCurrentlyCompleted,
						},
					},
				};

				// * Update task status on server
				await axios.request(updateConfig);

				// * Refresh task data after successful update
				await fetchCurrentTaskData();
			} catch (error) {
				console.error('Failed to toggle task completion:', error);
				// TODO: Implement error handling with user feedback
			}
		},
		[fetchCurrentTaskData],
	);

	/**
	 * * Handle day packup action
	 * ? Processes end-of-day task completion and cleanup
	 */
	const handleDayPackup = useCallback(async (): Promise<void> => {
		try {
			setIsPackingUp(true);
			await axios.request({
				data: { type: 'dayPackup' },
				method: 'PUT',
				url: '/api/tasks',
			});

			// * Refresh data after packup
			await fetchCurrentTaskData();
		} catch (error) {
			console.error('Failed to execute day packup:', error);
			// TODO: Add user notification for packup completion/failure
		} finally {
			setIsPackingUp(false);
		}
	}, [fetchCurrentTaskData]);

	// ! SIDE EFFECTS AND LIFECYCLE
	/**
	 * * Countdown timer effect
	 * ? Updates countdown every 100ms for smooth animation
	 * * Cleanup: Clears interval on component unmount
	 */
	useEffect(() => {
		const updateCountdownTimer = (): void => {
			setCountdownTimeLeft(calculateRemainingTime());
		};

		// * Update timer more frequently for smoother countdown
		const timerInterval = setInterval(updateCountdownTimer, 100);

		return () => clearInterval(timerInterval);
	}, [calculateRemainingTime]);

	/**
	 * * Time details calculation effect
	 * ? Updates countdown breakdown and current time display
	 * * Triggers whenever countdownTimeLeft changes
	 */
	useEffect(() => {
		// * Calculate countdown breakdown
		const timeBreakdown: TimeBreakdown = {
			days: Math.floor(countdownTimeLeft / (1000 * 60 * 60 * 24)),
			hours: Math.floor(
				(countdownTimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
			),
			minutes: Math.floor((countdownTimeLeft % (1000 * 60 * 60)) / (1000 * 60)),
			seconds: Math.floor((countdownTimeLeft % (1000 * 60)) / 1000),
		};
		setCountdownBreakdown(timeBreakdown);

		// * Update current time display
		const currentDate = new Date();
		const currentTimeData: ClockTimeDetails = {
			date: `${currentDate.getDate()}/${
				currentDate.getMonth() + 1
			}/${currentDate.getFullYear()}`,
			hours: currentDate.getHours(),
			minutes: currentDate.getMinutes(),
			seconds: currentDate.getSeconds(),
		};
		setCurrentTimeDetails(currentTimeData);
	}, [countdownTimeLeft]);

	/**
	 * * Initial data loading and progress calculation
	 * ? Runs once on component mount to set up initial state
	 */
	useEffect(() => {
		// * Calculate time remaining percentage
		const calculateTimePercentage = (): void => {
			const currentTime = new Date().getTime();
			const totalTimeSpan = TARGET_DATE.getTime() - START_DATE.getTime();
			const timeRemaining = TARGET_DATE.getTime() - currentTime;

			if (timeRemaining <= 0) {
				setTimeRemainingPercentage(0);
				return;
			}

			const percentageRemaining = (timeRemaining / totalTimeSpan) * 100;
			setTimeRemainingPercentage(percentageRemaining);
		};

		calculateTimePercentage();
		fetchCurrentTaskData();
	}, [fetchCurrentTaskData]);

	// ! RENDER COMPONENT
	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4 md:p-6'>
			<div className='mx-auto max-w-7xl space-y-6'>
				{/* ! HEADER SECTION WITH STATS */}
				<div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
					<div className='space-y-2'>
						<h1 className='bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-indigo-400'>
							Task Tracker Dashboard
						</h1>
						<p className='text-sm text-muted-foreground'>
							Track your progress and stay focused on your goals
						</p>
					</div>

					{/* * Quick Stats Cards */}
					<div className='flex gap-2'>
						<Badge variant='secondary' className='gap-1.5 px-3 py-1.5'>
							<Target className='h-3.5 w-3.5' />
							{taskStats.remaining} remaining
						</Badge>
						<Badge variant='outline' className='gap-1.5 px-3 py-1.5'>
							<TrendingUp className='h-3.5 w-3.5' />
							{taskStats.completionRate}% complete
						</Badge>
					</div>
				</div>

				{/* ! COUNTDOWN TIMER SECTION */}
				<Card className='overflow-hidden border-0 bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 text-white shadow-2xl'>
					<CardContent className='p-6'>
						<div className='mb-6 flex items-center justify-between'>
							<h2 className='flex items-center gap-2 text-xl font-semibold'>
								<Clock className='h-5 w-5' />
								Time Remaining
							</h2>
							<Badge
								variant='secondary'
								className='bg-white/20 text-white hover:bg-white/30'>
								{Math.round(100 - timeRemainingPercentage)}% elapsed
							</Badge>
						</div>

						<div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
							{/* * Days Counter */}
							<div className='group relative overflow-hidden rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105'>
								<div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
								<div className='relative'>
									<div className='text-3xl font-bold md:text-4xl'>
										{countdownBreakdown.days}
									</div>
									<div className='text-sm font-medium opacity-90'>Days</div>
									<div className='mt-1 text-xs opacity-70'>
										of {TOTAL_DAYS} total
									</div>
								</div>
							</div>

							{/* * Hours Counter */}
							<div className='group relative overflow-hidden rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105'>
								<div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
								<div className='relative'>
									<div className='text-3xl font-bold md:text-4xl'>
										{String(countdownBreakdown.hours).padStart(2, '0')}
									</div>
									<div className='text-sm font-medium opacity-90'>Hours</div>
								</div>
							</div>

							{/* * Minutes Counter */}
							<div className='group relative overflow-hidden rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105'>
								<div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
								<div className='relative'>
									<div className='text-3xl font-bold md:text-4xl'>
										{String(countdownBreakdown.minutes).padStart(2, '0')}
									</div>
									<div className='text-sm font-medium opacity-90'>Minutes</div>
								</div>
							</div>

							{/* * Seconds Counter */}
							<div className='group relative overflow-hidden rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105'>
								<div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
								<div className='relative'>
									<div className='text-3xl font-bold md:text-4xl'>
										{String(countdownBreakdown.seconds).padStart(2, '0')}
									</div>
									<div className='text-sm font-medium opacity-90'>Seconds</div>
								</div>
							</div>
						</div>

						{/* * Overall Progress Bar */}
						<div className='mt-6 space-y-2'>
							<div className='flex justify-between text-sm'>
								<span>Overall Progress</span>
								<span>{Math.round(100 - timeRemainingPercentage)}%</span>
							</div>
							<Progress
								value={100 - timeRemainingPercentage}
								className='h-3 bg-white/20'
							/>
						</div>
					</CardContent>
				</Card>

				{/* ! MAIN CONTENT GRID */}
				<div className='grid gap-6 lg:grid-cols-3'>
					{/* ! TASKS MANAGEMENT SECTION */}
					<div className='lg:col-span-2'>
						<Card className='h-full'>
							<CardHeader className='space-y-0 pb-4'>
								<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
									<div>
										<h3 className='text-xl font-semibold'>
											Today's Tasks: DATE: {currentDateInBackend}
										</h3>
										<p className='text-sm text-muted-foreground'>
											{taskStats.completed} of {taskStats.total} completed
										</p>
									</div>

									{/* * Action Button */}
									<Button
										onClick={handleDayPackup}
										disabled={isPackingUp}
										className='gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'>
										{isPackingUp ? (
											<>
												<div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
												Packing Up...
											</>
										) : (
											<>
												<Package className='h-4 w-4' />
												Day Packup
											</>
										)}
									</Button>
								</div>

								{/* * Daily Progress */}
								<div className='space-y-2'>
									<div className='flex justify-between text-sm'>
										<span className='flex items-center gap-1.5'>
											<Zap className='h-4 w-4 text-yellow-500' />
											Daily Points
										</span>
										<span className='font-medium'>{dailyPoints}/100</span>
									</div>
									<Progress value={dailyPoints} className='h-2' />
								</div>
							</CardHeader>

							<CardContent className='pt-0'>
								{/* ! TASKS LIST */}
								<div className='space-y-3'>
									{isLoading ? (
										// * Loading State
										<div className='space-y-3'>
											{Array.from({ length: 3 }).map((_, i) => (
												<div
													key={i}
													className='h-16 animate-pulse rounded-lg bg-muted'
												/>
											))}
										</div>
									) : sortedTodoItems.length === 0 ? (
										// * Empty State
										<Card className='border-2 border-dashed bg-muted/30'>
											<CardContent className='py-12 text-center'>
												<div className='mx-auto mb-4 h-12 w-12 rounded-full bg-muted-foreground/10 flex items-center justify-center'>
													<CheckSquare className='h-6 w-6 text-muted-foreground' />
												</div>
												<h4 className='mb-2 text-lg font-medium'>
													No tasks yet
												</h4>
												<p className='text-sm text-muted-foreground'>
													Your task list is empty. Add some tasks to get
													started!
												</p>
											</CardContent>
										</Card>
									) : (
										// * Task Items List
										<div className='max-h-[400px] space-y-3 overflow-y-auto pr-2'>
											{sortedTodoItems.map((todoItem, index) => (
												<Card
													key={todoItem.id}
													className={`group transition-all duration-200 hover:shadow-md ${
														todoItem.completed
															? 'bg-muted/50 border-muted'
															: 'hover:shadow-lg'
													}`}>
													<CardContent className='p-4'>
														<div className='flex items-center gap-3'>
															{/* * Task Number */}
															<div
																className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
																	todoItem.completed
																		? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
																		: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
																}`}>
																{index + 1}
															</div>

															{/* * Task Content */}
															<div className='flex-1 min-w-0'>
																<p
																	className={`text-sm font-medium truncate ${
																		todoItem.completed
																			? 'text-muted-foreground line-through'
																			: 'text-foreground'
																	}`}>
																	{todoItem.text}
																</p>
															</div>

															{/* * Action Button */}
															<Button
																variant='outline'
																size='sm'
																onClick={() =>
																	toggleTaskCompletion({
																		taskId: todoItem.id,
																		isCurrentlyCompleted: todoItem.completed,
																	})
																}
																className={`shrink-0 transition-all duration-200 ${
																	todoItem.completed
																		? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
																		: 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
																}`}>
																{todoItem.completed ? (
																	<>
																		<XSquare className='h-4 w-4 mr-1.5' />
																		Undo
																	</>
																) : (
																	<>
																		<CheckSquare className='h-4 w-4 mr-1.5' />
																		Done
																	</>
																)}
															</Button>
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* ! SIDEBAR */}
					<div className='space-y-6'>
						{/* * Current Time Card */}
						<Card className='bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-lg'>
							<CardHeader className='pb-3'>
								<h3 className='flex items-center gap-2 text-lg font-semibold'>
									<Clock className='h-5 w-5' />
									Current Time
								</h3>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='text-center'>
									<div className='text-3xl font-mono font-bold'>
										{String(currentTimeDetails.hours).padStart(2, '0')}:
										{String(currentTimeDetails.minutes).padStart(2, '0')}:
										{String(currentTimeDetails.seconds).padStart(2, '0')}
									</div>
									<div className='text-sm opacity-90 mt-1'>
										{currentTimeDetails.date}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* * Calendar Card */}
						<Card>
							<CardHeader className='pb-3'>
								<h3 className='flex items-center gap-2 text-lg font-semibold'>
									<CalendarIcon className='h-5 w-5' />
									Calendar
								</h3>
							</CardHeader>
							<CardContent className='p-3'>
								<Calendar
									mode='single'
									selected={selectedCalendarDate}
									onSelect={setSelectedCalendarDate}
									className='rounded-lg'
								/>
							</CardContent>
						</Card>

						{/* * Quick Stats Card */}
						<Card>
							<CardHeader className='pb-3'>
								<h3 className='text-lg font-semibold'>Quick Stats</h3>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-2 gap-4'>
									<div className='text-center'>
										<div className='text-2xl font-bold text-green-600 dark:text-green-400'>
											{taskStats.completed}
										</div>
										<div className='text-xs text-muted-foreground'>
											Completed
										</div>
									</div>
									<div className='text-center'>
										<div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
											{taskStats.remaining}
										</div>
										<div className='text-xs text-muted-foreground'>
											Remaining
										</div>
									</div>
								</div>
								<div className='rounded-lg bg-muted/50 p-3'>
									<div className='flex items-center justify-between text-sm'>
										<span>Completion Rate</span>
										<span className='font-medium'>
											{taskStats.completionRate}%
										</span>
									</div>
									<Progress
										value={taskStats.completionRate}
										className='mt-2 h-1.5'
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

// ! EXPORT
export default HomePage;

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient backgrounds and glass morphism effects
// * 2. Improved typography with gradient text effects
// * 3. Better card layouts with proper spacing and shadows
// * 4. Interactive hover effects and animations
// * 5. Loading states and skeleton screens
// * 6. Better empty states with illustrations
// * 7. Consistent color system and better contrast
// * 8. Responsive design with mobile-first approach
// * 9. Micro-interactions and smooth transitions
// * 10. Better visual hierarchy and information architecture

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Memoized sorted todos to prevent unnecessary re-renders
// * 2. Centralized API calls to reduce code duplication
// * 3. Proper cleanup of intervals to prevent memory leaks
// * 4. Callback functions to prevent unnecessary re-renders
// * 5. Optimized timer updates (100ms for smooth animation)

// ! FUTURE IMPROVEMENTS:
// TODO: Add error boundary for better error handling
// TODO: Implement toast notifications for user feedback
// TODO: Add drag and drop for task reordering
// TODO: Implement dark/light mode animations
// TODO: Add sound effects for task completion
// TODO: Implement keyboard shortcuts for accessibility
// TODO: Add data visualization charts for progress tracking
// TODO: Implement offline support with service workers
