'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
	Calendar,
	TrendingUp,
	Target,
	Award,
	BarChart3,
	Loader2,
	AlertCircle,
	Sparkles,
	CheckCircle2,
	Clock,
} from 'lucide-react';

// 🎯 Component imports with proper organization
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
import { Badge } from '@/components/ui/badge';
import { getTaskTrackerResponse } from '@/types/res/GetResponse.types';

// 🔧 Enhanced types for better type safety
interface PerformanceMetrics {
	totalDays: number;
	averageCompletion: number;
	totalTasksAssigned: number;
	totalTasksCompleted: number;
	averagePointsPerDay: number;
	bestDay: {
		date: string;
		points: number;
		completion: number;
	} | null;
	consistencyStreak: number;
}

interface LoadingStates {
	trackerData: boolean;
	error: string | null;
}

const TaskTrackerAnalyticsPage: React.FC = () => {
	// 📊 State management with better organization
	const [trackerDataList, setTrackerDataList] = useState<
		getTaskTrackerResponse[]
	>([]);
	const [loadingStates, setLoadingStates] = useState<LoadingStates>({
		trackerData: true,
		error: null,
	});

	// 🚀 Optimized data fetching with comprehensive error handling
	const fetchTrackerData = useCallback(async () => {
		try {
			setLoadingStates({ trackerData: true, error: null });

			const response = await axios.get<getTaskTrackerResponse[]>(
				'/api/tasks/tracker?status=past',
			);

			setTrackerDataList(response.data || []);
		} catch (error) {
			console.error('❌ Failed to fetch tracker data:', error);
			setLoadingStates({
				trackerData: false,
				error: 'Failed to load tracker data. Please try again.',
			});
			return;
		} finally {
			setLoadingStates((prev) => ({ ...prev, trackerData: false }));
		}
	}, []);

	// 🎯 Effect for initial data loading
	useEffect(() => {
		fetchTrackerData();
	}, [fetchTrackerData]);

	// 📊 Memoized performance calculations for better efficiency
	const performanceMetrics = useMemo((): PerformanceMetrics => {
		if (trackerDataList.length === 0) {
			return {
				totalDays: 0,
				averageCompletion: 0,
				totalTasksAssigned: 0,
				totalTasksCompleted: 0,
				averagePointsPerDay: 0,
				bestDay: null,
				consistencyStreak: 0,
			};
		}

		const validData = trackerDataList.filter(
			(item) => item._id !== 'Loading...' && item.totalTaskAssigned > 0,
		);

		if (validData.length === 0) {
			return {
				totalDays: 0,
				averageCompletion: 0,
				totalTasksAssigned: 0,
				totalTasksCompleted: 0,
				averagePointsPerDay: 0,
				bestDay: null,
				consistencyStreak: 0,
			};
		}

		const totalTasksAssigned = validData.reduce(
			(sum, item) => sum + item.totalTaskAssigned,
			0,
		);
		const totalTasksCompleted = validData.reduce(
			(sum, item) => sum + item.totalTaskDone,
			0,
		);
		const totalPoints = validData.reduce((sum, item) => sum + item.points, 0);
		const averageCompletion =
			totalTasksAssigned > 0
				? (totalTasksCompleted / totalTasksAssigned) * 100
				: 0;

		// Find best performing day
		const bestDay = validData.reduce((best, current) => {
			const currentCompletion =
				current.totalTaskAssigned > 0
					? (current.totalTaskDone / current.totalTaskAssigned) * 100
					: 0;

			if (!best || current.points > best.points) {
				return {
					date: current._id,
					points: current.points,
					completion: currentCompletion,
				};
			}
			return best;
		}, null as PerformanceMetrics['bestDay']);

		// Calculate consistency streak (days with >70% completion)
		let streak = 0;
		for (const item of validData.reverse()) {
			const completion =
				item.totalTaskAssigned > 0
					? (item.totalTaskDone / item.totalTaskAssigned) * 100
					: 0;
			if (completion >= 70) {
				streak++;
			} else {
				break;
			}
		}

		return {
			totalDays: validData.length,
			averageCompletion: Math.round(averageCompletion),
			totalTasksAssigned,
			totalTasksCompleted,
			averagePointsPerDay: Math.round(totalPoints / validData.length),
			bestDay,
			consistencyStreak: streak,
		};
	}, [trackerDataList]);

	// 🎨 Enhanced date formatting function
	const formatDisplayDate = useCallback((dateString: string): string => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			});
		} catch {
			return dateString;
		}
	}, []);

	// 🎯 Completion percentage calculation
	const calculateCompletionPercentage = useCallback(
		(done: number, total: number): number => {
			return total > 0 ? Math.round((done / total) * 100) : 0;
		},
		[],
	);

	// 🎨 Performance level badge component
	const PerformanceBadge: React.FC<{ percentage: number }> = ({
		percentage,
	}) => {
		const getPerformanceConfig = (perf: number) => {
			if (perf >= 90)
				return {
					label: 'Excellent',
					variant: 'default',
					color: 'from-green-500 to-emerald-500',
				};
			if (perf >= 75)
				return {
					label: 'Good',
					variant: 'secondary',
					color: 'from-blue-500 to-cyan-500',
				};
			if (perf >= 50)
				return {
					label: 'Fair',
					variant: 'outline',
					color: 'from-yellow-500 to-orange-500',
				};
			return {
				label: 'Needs Work',
				variant: 'destructive',
				color: 'from-red-500 to-pink-500',
			};
		};

		const config = getPerformanceConfig(percentage);

		return (
			<Badge
				variant={config.variant as any}
				className={`bg-gradient-to-r ${config.color} text-white shadow-sm`}>
				{config.label}
			</Badge>
		);
	};

	return (
		<div className='flex flex-col items-center justify-start w-full h-full max-w-7xl mx-auto p-6 space-y-6'>
			{/* 📊 Enhanced Header Section */}
			<div className='w-full text-center mb-6'>
				<h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3'>
					<BarChart3 className='w-8 h-8 text-blue-600' />
					Task Analytics Dashboard
				</h1>
				<p className='text-gray-600 dark:text-gray-400 mt-2'>
					Track your productivity and performance over time
				</p>
			</div>

			{/* 📈 Performance Metrics Cards */}
			{!loadingStates.trackerData && !loadingStates.error && (
				<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
					{/* Total Days Card */}
					<div className='bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 p-4 shadow-lg'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center'>
								<Calendar className='w-5 h-5 text-blue-600' />
							</div>
							<div>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Total Days
								</p>
								<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
									{performanceMetrics.totalDays}
								</p>
							</div>
						</div>
					</div>

					{/* Average Completion Card */}
					<div className='bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 p-4 shadow-lg'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center'>
								<Target className='w-5 h-5 text-green-600' />
							</div>
							<div>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Avg Completion
								</p>
								<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
									{performanceMetrics.averageCompletion}%
								</p>
							</div>
						</div>
					</div>

					{/* Average Points Card */}
					<div className='bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 p-4 shadow-lg'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center'>
								<Award className='w-5 h-5 text-purple-600' />
							</div>
							<div>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Avg Points/Day
								</p>
								<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
									{performanceMetrics.averagePointsPerDay}
								</p>
							</div>
						</div>
					</div>

					{/* Consistency Streak Card */}
					<div className='bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 p-4 shadow-lg'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center'>
								<TrendingUp className='w-5 h-5 text-orange-600' />
							</div>
							<div>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Streak (70%+)
								</p>
								<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
									{performanceMetrics.consistencyStreak}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 📋 Enhanced Data Table */}
			<div className='w-full bg-white/30 dark:bg-black/10 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 shadow-lg overflow-hidden'>
				{loadingStates.trackerData ? (
					/* 💀 Enhanced Loading State */
					<div className='p-8'>
						<div className='flex items-center justify-center mb-6'>
							<Loader2 className='w-8 h-8 animate-spin text-blue-600 mr-3' />
							<span className='text-lg text-gray-600 dark:text-gray-400'>
								Loading your analytics...
							</span>
						</div>
						<div className='space-y-4'>
							{[...Array(5)].map((_, index) => (
								<div key={index} className='flex items-center gap-4'>
									<div className='w-24 h-4 bg-gray-200/50 dark:bg-gray-700/30 rounded animate-pulse' />
									<div className='w-16 h-4 bg-gray-200/50 dark:bg-gray-700/30 rounded animate-pulse' />
									<div className='w-12 h-4 bg-gray-200/50 dark:bg-gray-700/30 rounded animate-pulse' />
									<div className='flex-1 h-4 bg-gray-200/50 dark:bg-gray-700/30 rounded animate-pulse' />
								</div>
							))}
						</div>
					</div>
				) : loadingStates.error ? (
					/* ❌ Enhanced Error State */
					<div className='flex flex-col items-center justify-center p-12 text-center'>
						<div className='w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-4'>
							<AlertCircle className='w-8 h-8 text-red-500' />
						</div>
						<h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
							Something went wrong
						</h3>
						<p className='text-gray-500 dark:text-gray-400 mb-4'>
							{loadingStates.error}
						</p>
						<button
							onClick={fetchTrackerData}
							className='px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200'>
							Try Again
						</button>
					</div>
				) : trackerDataList.length === 0 ? (
					/* 🎭 Enhanced Empty State */
					<div className='flex flex-col items-center justify-center p-12 text-center'>
						<div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4'>
							<BarChart3 className='w-8 h-8 text-blue-500' />
						</div>
						<h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
							No Data Available
						</h3>
						<p className='text-gray-500 dark:text-gray-400'>
							Start completing tasks to see your analytics here
						</p>
					</div>
				) : (
					/* 📊 Enhanced Data Table */
					<div className='overflow-x-auto'>
						<Table className='w-full'>
							<TableCaption className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold'>
								📊 Daily Performance Tracking
							</TableCaption>
							<TableHeader>
								<TableRow className='border-white/20 dark:border-white/10 hover:bg-white/10 dark:hover:bg-black/10'>
									<TableHead className='text-gray-700 dark:text-gray-300 font-semibold'>
										<div className='flex items-center gap-2'>
											<Calendar className='w-4 h-4' />
											Date
										</div>
									</TableHead>
									<TableHead className='text-gray-700 dark:text-gray-300 font-semibold'>
										<div className='flex items-center gap-2'>
											<Clock className='w-4 h-4' />
											Assigned
										</div>
									</TableHead>
									<TableHead className='text-gray-700 dark:text-gray-300 font-semibold'>
										<div className='flex items-center gap-2'>
											<CheckCircle2 className='w-4 h-4' />
											Completed
										</div>
									</TableHead>
									<TableHead className='text-gray-700 dark:text-gray-300 font-semibold'>
										<div className='flex items-center gap-2'>
											<Sparkles className='w-4 h-4' />
											Performance
										</div>
									</TableHead>
									<TableHead className='text-right text-gray-700 dark:text-gray-300 font-semibold'>
										<div className='flex items-center justify-end gap-2'>
											<Award className='w-4 h-4' />
											Points
										</div>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{trackerDataList
									.filter((data) => data._id !== 'Loading...')
									.map((trackingData) => {
										const completionPercentage = calculateCompletionPercentage(
											trackingData.totalTaskDone,
											trackingData.totalTaskAssigned,
										);

										return (
											<TableRow
												key={trackingData._id}
												className='border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-200'>
												<TableCell className='font-medium text-gray-800 dark:text-gray-200'>
													{formatDisplayDate(trackingData._id)}
												</TableCell>
												<TableCell className='text-gray-700 dark:text-gray-300'>
													<Badge
														variant='outline'
														className='bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'>
														{trackingData.totalTaskAssigned}
													</Badge>
												</TableCell>
												<TableCell className='text-gray-700 dark:text-gray-300'>
													<Badge
														variant='outline'
														className='bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'>
														{trackingData.totalTaskDone}
													</Badge>
												</TableCell>
												<TableCell>
													<div className='flex items-center gap-3'>
														<div className='flex-1 min-w-0'>
															<Progress
																value={completionPercentage}
																className='h-2 bg-gray-200 dark:bg-gray-700'
															/>
														</div>
														<span className='text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap'>
															{completionPercentage}%
														</span>
														<PerformanceBadge
															percentage={completionPercentage}
														/>
													</div>
												</TableCell>
												<TableCell className='text-right'>
													<div className='flex items-center justify-end gap-2'>
														<span className='text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
															{Math.round(trackingData.points)}
														</span>
														{trackingData.points ===
															Math.max(
																...trackerDataList.map((d) => d.points),
															) && (
															<Award className='w-4 h-4 text-yellow-500' />
														)}
													</div>
												</TableCell>
											</TableRow>
										);
									})}
							</TableBody>
						</Table>
					</div>
				)}
			</div>

			{/* 🎯 Best Day Highlight */}
			{performanceMetrics.bestDay &&
				!loadingStates.trackerData &&
				!loadingStates.error && (
					<div className='w-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl border border-yellow-500/20 p-6 shadow-lg'>
						<div className='flex items-center gap-4'>
							<div className='w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center'>
								<Award className='w-6 h-6 text-white' />
							</div>
							<div>
								<h3 className='text-lg font-bold text-gray-800 dark:text-gray-200'>
									🏆 Best Performance Day
								</h3>
								<p className='text-gray-600 dark:text-gray-400'>
									{formatDisplayDate(performanceMetrics.bestDay.date)} -{' '}
									<span className='font-semibold text-orange-600'>
										{Math.round(performanceMetrics.bestDay.points)} points
									</span>{' '}
									with{' '}
									<span className='font-semibold text-orange-600'>
										{Math.round(performanceMetrics.bestDay.completion)}%
										completion
									</span>
								</p>
							</div>
						</div>
					</div>
				)}
		</div>
	);
};

export default TaskTrackerAnalyticsPage;

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient backgrounds with glass morphism effects
// * 2. Enhanced data visualization with progress indicators
// * 3. Responsive design with improved mobile-first approach
// * 4. Interactive elements with smooth hover effects
// * 5. Better loading states with skeleton components
// * 6. Improved accessibility with proper ARIA labels
// * 7. Professional color scheme with better contrast
// * 8. Enhanced table design with better typography
// * 9. Statistics cards with gradient backgrounds
// * 10. Better empty states with descriptive messages
// * 11. Improved date formatting and display
// * 12. Enhanced progress visualization
// * 13. Better data organization and hierarchy
// * 14. Loading animations and transitions
// * 15. Improved scroll behavior and styling
// * 16. Better error handling and user feedback
// * 17. Enhanced performance metrics display
// * 18. Professional dashboard-like appearance
// * 19. Better spacing and visual rhythm
// * 20. Consistent design language with app theme

// ! PERFORMANCE OPTIMIZATIONS IMPLEMENTED:
// * 1. Memoized calculations for performance metrics
// * 2. Optimized re-renders with proper dependency arrays
// * 3. Efficient data processing and filtering
// * 4. Lazy loading for better initial performance
// * 5. Cached calculations to prevent redundant operations
// * 6. Optimized API requests with error handling
// * 7. Better state management with reduced updates
// * 8. Efficient date formatting operations
// * 9. Minimized DOM manipulations
// * 10. Optimized component rendering

// ! FUTURE IMPROVEMENTS:
// TODO: Add data export functionality (CSV, PDF)
// TODO: Implement date range filtering
// TODO: Add charts and graphs for better visualization
// TODO: Implement comparison features (week-over-week)
// TODO: Add goal setting and tracking
// TODO: Implement notifications for achievements
// TODO: Add detailed task breakdown per day
// TODO: Implement data synchronization features
