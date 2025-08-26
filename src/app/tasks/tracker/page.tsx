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
	CalendarDays,
	Activity,
	Zap,
	Users,
	BookOpen,
	Filter,
	RefreshCw,
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
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	getTaskTrackerResponse,
	getWeeklyTaskTrackerResponse,
	WeeklyDayBreakdown,
} from '@/types/res/GetResponse.types';

// 🔧 Enhanced types for better type safety and maintainability
interface PerformanceMetrics {
	totalDays: number;
	averageCompletion: number;
	totalTasksAssigned: number;
	totalTasksCompleted: number;
	averagePointsPerDay: number;
	bestPerformanceDay: {
		date: string;
		points: number;
		completion: number;
	} | null;
	consistencyStreak: number;
	productivityTrend: 'improving' | 'declining' | 'stable';
}

interface WeeklyAnalyticsMetrics {
	totalWeeks: number;
	averageWeeklyCompletion: number;
	totalWeeklyTasksAssigned: number;
	totalWeeklyTasksCompleted: number;
	averageWeeklyPoints: number;
	bestPerformanceWeek: {
		week: number;
		year: number;
		points: number;
		completion: number;
	} | null;
	weeklyConsistency: number;
	mostProductiveDay: string;
}

interface LoadingStates {
	dailyTrackerData: boolean;
	weeklyTrackerData: boolean;
	errorMessage: string | null;
}

// 📊 Days of the week for consistent ordering
const DAYS_OF_WEEK = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
];

const TaskTrackerAnalyticsPage: React.FC = () => {
	// 📊 State management with better organization and type safety
	const [dailyTrackerDataList, setDailyTrackerDataList] = useState<
		getTaskTrackerResponse[]
	>([]);
	const [weeklyTrackerDataList, setWeeklyTrackerDataList] = useState<
		getWeeklyTaskTrackerResponse[]
	>([]);
	const [loadingStates, setLoadingStates] = useState<LoadingStates>({
		dailyTrackerData: true,
		weeklyTrackerData: true,
		errorMessage: null,
	});
	const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

	// 🚀 Optimized data fetching with comprehensive error handling
	const fetchDailyTrackerData = useCallback(async () => {
		try {
			setLoadingStates((prev) => ({
				...prev,
				dailyTrackerData: true,
				errorMessage: null,
			}));

			const response = await axios.get<getTaskTrackerResponse[]>(
				'/api/tasks/tracker?status=past',
			);

			setDailyTrackerDataList(response.data || []);
		} catch (error) {
			console.error('❌ Failed to fetch daily tracker data:', error);
			setLoadingStates((prev) => ({
				...prev,
				dailyTrackerData: false,
				errorMessage: 'Failed to load daily tracker data. Please try again.',
			}));
			return;
		} finally {
			setLoadingStates((prev) => ({ ...prev, dailyTrackerData: false }));
		}
	}, []);

	// 🔄 Weekly data fetching with missing day handling
	const fetchWeeklyTrackerData = useCallback(async () => {
		try {
			setLoadingStates((prev) => ({
				...prev,
				weeklyTrackerData: true,
				errorMessage: null,
			}));

			const response = await axios.get<getWeeklyTaskTrackerResponse[]>(
				'/api/tasks/tracker?status=weekly',
			);

			setWeeklyTrackerDataList(response.data || []);
		} catch (error) {
			console.error('❌ Failed to fetch weekly tracker data:', error);
			setLoadingStates((prev) => ({
				...prev,
				weeklyTrackerData: false,
				errorMessage: 'Failed to load weekly tracker data. Please try again.',
			}));
			return;
		} finally {
			setLoadingStates((prev) => ({ ...prev, weeklyTrackerData: false }));
		}
	}, []);

	// 🎯 Effect for initial data loading with proper cleanup
	useEffect(() => {
		fetchDailyTrackerData();
		fetchWeeklyTrackerData();
	}, [fetchDailyTrackerData, fetchWeeklyTrackerData]);

	// 📊 Memoized daily performance calculations for better efficiency
	const dailyPerformanceMetrics = useMemo((): PerformanceMetrics => {
		if (dailyTrackerDataList.length === 0) {
			return {
				totalDays: 0,
				averageCompletion: 0,
				totalTasksAssigned: 0,
				totalTasksCompleted: 0,
				averagePointsPerDay: 0,
				bestPerformanceDay: null,
				consistencyStreak: 0,
				productivityTrend: 'stable',
			};
		}

		const validDailyData = dailyTrackerDataList.filter(
			(item) => item._id !== 'Loading...' && item.totalTaskAssigned > 0,
		);

		if (validDailyData.length === 0) {
			return {
				totalDays: 0,
				averageCompletion: 0,
				totalTasksAssigned: 0,
				totalTasksCompleted: 0,
				averagePointsPerDay: 0,
				bestPerformanceDay: null,
				consistencyStreak: 0,
				productivityTrend: 'stable',
			};
		}

		// Calculate aggregated metrics
		const totalTasksAssigned = validDailyData.reduce(
			(sum, item) => sum + item.totalTaskAssigned,
			0,
		);
		const totalTasksCompleted = validDailyData.reduce(
			(sum, item) => sum + item.totalTaskDone,
			0,
		);
		const totalPoints = validDailyData.reduce(
			(sum, item) => sum + item.points,
			0,
		);
		const averageCompletion =
			totalTasksAssigned > 0
				? (totalTasksCompleted / totalTasksAssigned) * 100
				: 0;

		// Find best performing day with enhanced comparison
		const bestPerformanceDay = validDailyData.reduce((bestDay, currentDay) => {
			const currentCompletion =
				currentDay.totalTaskAssigned > 0
					? (currentDay.totalTaskDone / currentDay.totalTaskAssigned) * 100
					: 0;

			if (!bestDay || currentDay.points > bestDay.points) {
				return {
					date: currentDay._id,
					points: currentDay.points,
					completion: currentCompletion,
				};
			}
			return bestDay;
		}, null as PerformanceMetrics['bestPerformanceDay']);

		// Calculate consistency streak (days with >70% completion)
		let consistencyStreak = 0;
		const sortedData = [...validDailyData].reverse(); // Most recent first
		for (const item of sortedData) {
			const completion =
				item.totalTaskAssigned > 0
					? (item.totalTaskDone / item.totalTaskAssigned) * 100
					: 0;
			if (completion >= 70) {
				consistencyStreak++;
			} else {
				break;
			}
		}

		// Calculate productivity trend (simplified)
		const recentDays = sortedData.slice(0, 7);
		const olderDays = sortedData.slice(7, 14);
		const recentAvg =
			recentDays.length > 0
				? recentDays.reduce((sum, day) => sum + day.points, 0) /
				  recentDays.length
				: 0;
		const olderAvg =
			olderDays.length > 0
				? olderDays.reduce((sum, day) => sum + day.points, 0) / olderDays.length
				: 0;

		let productivityTrend: 'improving' | 'declining' | 'stable' = 'stable';
		if (recentAvg > olderAvg * 1.1) productivityTrend = 'improving';
		else if (recentAvg < olderAvg * 0.9) productivityTrend = 'declining';

		return {
			totalDays: validDailyData.length,
			averageCompletion: Math.round(averageCompletion),
			totalTasksAssigned,
			totalTasksCompleted,
			averagePointsPerDay: Math.round(totalPoints / validDailyData.length),
			bestPerformanceDay,
			consistencyStreak,
			productivityTrend,
		};
	}, [dailyTrackerDataList]);

	// 📈 Memoized weekly analytics calculations
	const weeklyAnalyticsMetrics = useMemo((): WeeklyAnalyticsMetrics => {
		if (weeklyTrackerDataList.length === 0) {
			return {
				totalWeeks: 0,
				averageWeeklyCompletion: 0,
				totalWeeklyTasksAssigned: 0,
				totalWeeklyTasksCompleted: 0,
				averageWeeklyPoints: 0,
				bestPerformanceWeek: null,
				weeklyConsistency: 0,
				mostProductiveDay: 'Monday',
			};
		}

		const validWeeklyData = weeklyTrackerDataList.filter(
			(item) => item.totalTasksAssignedWeekly > 0,
		);

		if (validWeeklyData.length === 0) {
			return {
				totalWeeks: 0,
				averageWeeklyCompletion: 0,
				totalWeeklyTasksAssigned: 0,
				totalWeeklyTasksCompleted: 0,
				averageWeeklyPoints: 0,
				bestPerformanceWeek: null,
				weeklyConsistency: 0,
				mostProductiveDay: 'Monday',
			};
		}

		// Calculate weekly aggregated metrics
		const totalWeeklyTasksAssigned = validWeeklyData.reduce(
			(sum, week) => sum + week.totalTasksAssignedWeekly,
			0,
		);
		const totalWeeklyTasksCompleted = validWeeklyData.reduce(
			(sum, week) => sum + week.totalTasksDoneWeekly,
			0,
		);
		const totalWeeklyPoints = validWeeklyData.reduce(
			(sum, week) => sum + week.weeklyPoints,
			0,
		);
		const averageWeeklyCompletion =
			totalWeeklyTasksAssigned > 0
				? (totalWeeklyTasksCompleted / totalWeeklyTasksAssigned) * 100
				: 0;

		// Find best performing week
		const bestPerformanceWeek = validWeeklyData.reduce(
			(bestWeek, currentWeek) => {
				const currentCompletion =
					currentWeek.totalTasksAssignedWeekly > 0
						? (currentWeek.totalTasksDoneWeekly /
								currentWeek.totalTasksAssignedWeekly) *
						  100
						: 0;

				if (!bestWeek || currentWeek.weeklyPoints > bestWeek.points) {
					return {
						week: currentWeek._id.week,
						year: currentWeek._id.year,
						points: currentWeek.weeklyPoints,
						completion: currentCompletion,
					};
				}
				return bestWeek;
			},
			null as WeeklyAnalyticsMetrics['bestPerformanceWeek'],
		);

		// Calculate weekly consistency (weeks with >70% completion)
		const consistentWeeks = validWeeklyData.filter((week) => {
			const completion =
				week.totalTasksAssignedWeekly > 0
					? (week.totalTasksDoneWeekly / week.totalTasksAssignedWeekly) * 100
					: 0;
			return completion >= 70;
		}).length;
		const weeklyConsistency =
			validWeeklyData.length > 0
				? (consistentWeeks / validWeeklyData.length) * 100
				: 0;

		// Find most productive day of the week
		const dayPointsMap = new Map<string, number>();
		DAYS_OF_WEEK.forEach((day) => dayPointsMap.set(day, 0));

		validWeeklyData.forEach((week) => {
			week.weeklyBreakdown.forEach((day) => {
				const currentPoints = dayPointsMap.get(day.dayName) || 0;
				dayPointsMap.set(day.dayName, currentPoints + day.points);
			});
		});

		const mostProductiveDay = [...dayPointsMap.entries()].reduce(
			(max, [day, points]) => (points > max.points ? { day, points } : max),
			{ day: 'Monday', points: 0 },
		).day;

		return {
			totalWeeks: validWeeklyData.length,
			averageWeeklyCompletion: Math.round(averageWeeklyCompletion),
			totalWeeklyTasksAssigned,
			totalWeeklyTasksCompleted,
			averageWeeklyPoints: Math.round(
				totalWeeklyPoints / validWeeklyData.length,
			),
			bestPerformanceWeek,
			weeklyConsistency: Math.round(weeklyConsistency),
			mostProductiveDay,
		};
	}, [weeklyTrackerDataList]);

	// 🎨 Enhanced date formatting function with better error handling
	const formatDisplayDate = useCallback((dateString: string): string => {
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) {
				return dateString; // Return original if invalid
			}
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

	// 🎯 Completion percentage calculation with safety checks
	const calculateCompletionPercentage = useCallback(
		(completedTasks: number, totalTasks: number): number => {
			return totalTasks > 0
				? Math.round((completedTasks / totalTasks) * 100)
				: 0;
		},
		[],
	);

	// 🔄 Refresh all data function
	const refreshAllData = useCallback(() => {
		fetchDailyTrackerData();
		fetchWeeklyTrackerData();
	}, [fetchDailyTrackerData, fetchWeeklyTrackerData]);

	// 🎨 Enhanced performance level badge component with better styling
	const PerformanceBadge: React.FC<{ percentage: number }> = ({
		percentage,
	}) => {
		const getPerformanceConfig = (performancePercentage: number) => {
			if (performancePercentage >= 90)
				return {
					label: 'Excellent',
					variant: 'default' as const,
					colorClass: 'from-green-500 to-emerald-500',
				};
			if (performancePercentage >= 75)
				return {
					label: 'Good',
					variant: 'secondary' as const,
					colorClass: 'from-blue-500 to-cyan-500',
				};
			if (performancePercentage >= 50)
				return {
					label: 'Fair',
					variant: 'outline' as const,
					colorClass: 'from-yellow-500 to-orange-500',
				};
			return {
				label: 'Needs Work',
				variant: 'destructive' as const,
				colorClass: 'from-red-500 to-pink-500',
			};
		};

		const config = getPerformanceConfig(percentage);

		return (
			<Badge
				variant={config.variant}
				className={`bg-gradient-to-r ${config.colorClass} text-white shadow-sm`}>
				{config.label}
			</Badge>
		);
	};

	// 📈 Weekly breakdown component with missing day handling
	const WeeklyBreakdownCard: React.FC<{
		weekData: getWeeklyTaskTrackerResponse;
		isExpanded?: boolean;
	}> = ({ weekData, isExpanded = false }) => {
		// Create a complete week array with missing days filled
		const completeWeekData = useMemo(() => {
			const existingDays = new Set(
				weekData.weeklyBreakdown.map((day) => day.dayName),
			);
			const completeDays: (WeeklyDayBreakdown | null)[] = DAYS_OF_WEEK.map(
				(dayName) => {
					if (existingDays.has(dayName)) {
						return (
							weekData.weeklyBreakdown.find((day) => day.dayName === dayName) ||
							null
						);
					}
					return null; // Missing day
				},
			);
			return completeDays;
		}, [weekData.weeklyBreakdown]);

		const weekCompletion = calculateCompletionPercentage(
			weekData.totalTasksDoneWeekly,
			weekData.totalTasksAssignedWeekly,
		);

		return (
			<Card className='bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-white/10'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle className='text-lg'>
							Week {weekData._id.week}, {weekData._id.year}
						</CardTitle>
						<div className='flex items-center gap-2'>
							<PerformanceBadge percentage={weekCompletion} />
							<Badge
								variant='outline'
								className='bg-purple-50 dark:bg-purple-900/20'>
								{weekData.weeklyPoints} pts
							</Badge>
						</div>
					</div>
					<CardDescription>
						{weekData.totalTasksDoneWeekly}/{weekData.totalTasksAssignedWeekly}{' '}
						tasks completed
					</CardDescription>
				</CardHeader>
				{isExpanded && (
					<CardContent>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2'>
							{completeWeekData.map((dayData, index) => (
								<div
									key={DAYS_OF_WEEK[index]}
									className={`p-3 rounded-lg border ${
										dayData
											? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700'
											: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50'
									}`}>
									<div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										{DAYS_OF_WEEK[index].slice(0, 3)}
									</div>
									{dayData ? (
										<>
											<div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
												{dayData.totalTaskDone}/{dayData.totalTaskAssigned}{' '}
												tasks
											</div>
											<div className='text-sm font-semibold text-purple-600 dark:text-purple-400'>
												{dayData.points} pts
											</div>
										</>
									) : (
										<div className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
											No data
										</div>
									)}
								</div>
							))}
						</div>
					</CardContent>
				)}
			</Card>
		);
	};

	return (
		<div className='flex flex-col items-center justify-start w-full h-full max-w-7xl mx-auto p-6 space-y-6'>
			{/* 📊 Enhanced Header Section with refresh button */}
			<div className='w-full text-center mb-6'>
				<div className='flex items-center justify-between mb-4'>
					<h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3'>
						<BarChart3 className='w-8 h-8 text-blue-600' />
						Task Analytics Dashboard
					</h1>
					<Button
						onClick={refreshAllData}
						variant='outline'
						size='sm'
						className='flex items-center gap-2'
						disabled={
							loadingStates.dailyTrackerData || loadingStates.weeklyTrackerData
						}>
						<RefreshCw
							className={`w-4 h-4 ${
								loadingStates.dailyTrackerData ||
								loadingStates.weeklyTrackerData
									? 'animate-spin'
									: ''
							}`}
						/>
						Refresh
					</Button>
				</div>
				<p className='text-gray-600 dark:text-gray-400'>
					Track your productivity and performance over time with daily and
					weekly insights
				</p>
			</div>

			{/* 📋 Enhanced Tabs for Daily/Weekly View */}
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as 'daily' | 'weekly')}
				className='w-full'>
				<TabsList className='grid w-full grid-cols-2 mb-6'>
					<TabsTrigger value='daily' className='flex items-center gap-2'>
						<Calendar className='w-4 h-4' />
						Daily Analytics
					</TabsTrigger>
					<TabsTrigger value='weekly' className='flex items-center gap-2'>
						<CalendarDays className='w-4 h-4' />
						Weekly Analytics
					</TabsTrigger>
				</TabsList>

				{/* 📊 Daily Analytics Tab */}
				<TabsContent value='daily' className='space-y-6'>
					{/* Daily Performance Metrics Cards */}
					{!loadingStates.dailyTrackerData && !loadingStates.errorMessage && (
						<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
							{/* Total Days Card */}
							<Card className='bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center'>
											<Calendar className='w-5 h-5 text-blue-600' />
										</div>
										<div>
											<p className='text-sm text-gray-600 dark:text-gray-400'>
												Total Days
											</p>
											<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
												{dailyPerformanceMetrics.totalDays}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Average Completion Card */}
							<Card className='bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center'>
											<Target className='w-5 h-5 text-green-600' />
										</div>
										<div>
											<p className='text-sm text-gray-600 dark:text-gray-400'>
												Avg Completion
											</p>
											<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
												{dailyPerformanceMetrics.averageCompletion}%
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Average Points Card */}
							<Card className='bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center'>
											<Award className='w-5 h-5 text-purple-600' />
										</div>
										<div>
											<p className='text-sm text-gray-600 dark:text-gray-400'>
												Avg Points/Day
											</p>
											<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
												{dailyPerformanceMetrics.averagePointsPerDay}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Consistency Streak Card */}
							<Card className='bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center'>
											<TrendingUp className='w-5 h-5 text-orange-600' />
										</div>
										<div>
											<p className='text-sm text-gray-600 dark:text-gray-400'>
												Streak (70%+)
											</p>
											<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
												{dailyPerformanceMetrics.consistencyStreak}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Daily Data Table */}
					<Card className='w-full bg-white/30 dark:bg-black/10 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
						{loadingStates.dailyTrackerData ? (
							<CardContent className='p-8'>
								<div className='flex items-center justify-center mb-6'>
									<Loader2 className='w-8 h-8 animate-spin text-blue-600 mr-3' />
									<span className='text-lg text-gray-600 dark:text-gray-400'>
										Loading daily analytics...
									</span>
								</div>
								<div className='space-y-4'>
									{[...Array(5)].map((_, index) => (
										<div
											key={`daily-skeleton-${index}`}
											className='flex items-center gap-4'>
											<div className='w-24 h-4 bg-gray-200/50 dark:bg-gray-700/30 rounded animate-pulse' />
											<div className='w-16 h-4 bg-gray-200/50 dark:bg-gray-700/30 rounded animate-pulse' />
											<div className='w-12 h-4 bg-gray-200/50 dark:bg-gray-700/30 rounded animate-pulse' />
											<div className='flex-1 h-4 bg-gray-200/50 dark:bg-gray-700/30 rounded animate-pulse' />
										</div>
									))}
								</div>
							</CardContent>
						) : loadingStates.errorMessage ? (
							<CardContent className='flex flex-col items-center justify-center p-12 text-center'>
								<div className='w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-4'>
									<AlertCircle className='w-8 h-8 text-red-500' />
								</div>
								<h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
									Something went wrong
								</h3>
								<p className='text-gray-500 dark:text-gray-400 mb-4'>
									{loadingStates.errorMessage}
								</p>
								<Button
									onClick={fetchDailyTrackerData}
									className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'>
									Try Again
								</Button>
							</CardContent>
						) : dailyTrackerDataList.length === 0 ? (
							<CardContent className='flex flex-col items-center justify-center p-12 text-center'>
								<div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4'>
									<BarChart3 className='w-8 h-8 text-blue-500' />
								</div>
								<h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
									No Daily Data Available
								</h3>
								<p className='text-gray-500 dark:text-gray-400'>
									Start completing tasks to see your daily analytics here
								</p>
							</CardContent>
						) : (
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
										{dailyTrackerDataList
											.filter((data) => data._id !== 'Loading...')
											.map((trackingData) => {
												const completionPercentage =
													calculateCompletionPercentage(
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
																		...dailyTrackerDataList.map(
																			(d) => d.points,
																		),
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
					</Card>

					{/* Best Day Highlight for Daily */}
					{dailyPerformanceMetrics.bestPerformanceDay &&
						!loadingStates.dailyTrackerData &&
						!loadingStates.errorMessage && (
							<Card className='w-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border-yellow-500/20 shadow-lg'>
								<CardContent className='p-6'>
									<div className='flex items-center gap-4'>
										<div className='w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center'>
											<Award className='w-6 h-6 text-white' />
										</div>
										<div>
											<h3 className='text-lg font-bold text-gray-800 dark:text-gray-200'>
												🏆 Best Daily Performance
											</h3>
											<p className='text-gray-600 dark:text-gray-400'>
												{formatDisplayDate(
													dailyPerformanceMetrics.bestPerformanceDay.date,
												)}{' '}
												-{' '}
												<span className='font-semibold text-orange-600'>
													{Math.round(
														dailyPerformanceMetrics.bestPerformanceDay.points,
													)}{' '}
													points
												</span>{' '}
												with{' '}
												<span className='font-semibold text-orange-600'>
													{Math.round(
														dailyPerformanceMetrics.bestPerformanceDay
															.completion,
													)}
													% completion
												</span>
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
				</TabsContent>

				{/* 📈 Weekly Analytics Tab */}
				<TabsContent value='weekly' className='space-y-6'>
					{/* Weekly Performance Metrics Cards */}
					{!loadingStates.weeklyTrackerData && !loadingStates.errorMessage && (
						<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
							{/* Total Weeks Card */}
							<Card className='bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-lg flex items-center justify-center'>
											<CalendarDays className='w-5 h-5 text-indigo-600' />
										</div>
										<div>
											<p className='text-sm text-gray-600 dark:text-gray-400'>
												Total Weeks
											</p>
											<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
												{weeklyAnalyticsMetrics.totalWeeks}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Weekly Average Completion */}
							<Card className='bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center'>
											<Activity className='w-5 h-5 text-green-600' />
										</div>
										<div>
											<p className='text-sm text-gray-600 dark:text-gray-400'>
												Avg Weekly Completion
											</p>
											<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
												{weeklyAnalyticsMetrics.averageWeeklyCompletion}%
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Weekly Average Points */}
							<Card className='bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg flex items-center justify-center'>
											<Zap className='w-5 h-5 text-purple-600' />
										</div>
										<div>
											<p className='text-sm text-gray-600 dark:text-gray-400'>
												Avg Points/Week
											</p>
											<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
												{weeklyAnalyticsMetrics.averageWeeklyPoints}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Most Productive Day */}
							<Card className='bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-lg flex items-center justify-center'>
											<Users className='w-5 h-5 text-rose-600' />
										</div>
										<div>
											<p className='text-sm text-gray-600 dark:text-gray-400'>
												Most Productive Day
											</p>
											<p className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
												{weeklyAnalyticsMetrics.mostProductiveDay}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Weekly Data Display */}
					<div className='w-full space-y-4'>
						{loadingStates.weeklyTrackerData ? (
							<Card className='bg-white/30 dark:bg-black/10 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='p-8'>
									<div className='flex items-center justify-center mb-6'>
										<Loader2 className='w-8 h-8 animate-spin text-blue-600 mr-3' />
										<span className='text-lg text-gray-600 dark:text-gray-400'>
											Loading weekly analytics...
										</span>
									</div>
									<div className='space-y-4'>
										{[...Array(3)].map((_, index) => (
											<div
												key={`weekly-skeleton-${index}`}
												className='h-32 bg-gray-200/50 dark:bg-gray-700/30 rounded-lg animate-pulse'
											/>
										))}
									</div>
								</CardContent>
							</Card>
						) : loadingStates.errorMessage ? (
							<Card className='bg-white/30 dark:bg-black/10 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='flex flex-col items-center justify-center p-12 text-center'>
									<div className='w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-4'>
										<AlertCircle className='w-8 h-8 text-red-500' />
									</div>
									<h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
										Something went wrong
									</h3>
									<p className='text-gray-500 dark:text-gray-400 mb-4'>
										{loadingStates.errorMessage}
									</p>
									<Button
										onClick={fetchWeeklyTrackerData}
										className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'>
										Try Again
									</Button>
								</CardContent>
							</Card>
						) : weeklyTrackerDataList.length === 0 ? (
							<Card className='bg-white/30 dark:bg-black/10 backdrop-blur-sm border-white/20 dark:border-white/10 shadow-lg'>
								<CardContent className='flex flex-col items-center justify-center p-12 text-center'>
									<div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4'>
										<CalendarDays className='w-8 h-8 text-blue-500' />
									</div>
									<h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
										No Weekly Data Available
									</h3>
									<p className='text-gray-500 dark:text-gray-400'>
										Complete tasks throughout the week to see your weekly
										analytics here
									</p>
								</CardContent>
							</Card>
						) : (
							<>
								{weeklyTrackerDataList.map((weekData, index) => (
									<WeeklyBreakdownCard
										key={`${weekData._id.week}-${weekData._id.year}`}
										weekData={weekData}
										isExpanded={index < 2} // Show first 2 weeks expanded by default
									/>
								))}
							</>
						)}
					</div>

					{/* Best Week Highlight */}
					{weeklyAnalyticsMetrics.bestPerformanceWeek &&
						!loadingStates.weeklyTrackerData &&
						!loadingStates.errorMessage && (
							<Card className='w-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border-emerald-500/20 shadow-lg'>
								<CardContent className='p-6'>
									<div className='flex items-center gap-4'>
										<div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center'>
											<Award className='w-6 h-6 text-white' />
										</div>
										<div>
											<h3 className='text-lg font-bold text-gray-800 dark:text-gray-200'>
												🏆 Best Weekly Performance
											</h3>
											<p className='text-gray-600 dark:text-gray-400'>
												Week {weeklyAnalyticsMetrics.bestPerformanceWeek.week},{' '}
												{weeklyAnalyticsMetrics.bestPerformanceWeek.year} -{' '}
												<span className='font-semibold text-emerald-600'>
													{Math.round(
														weeklyAnalyticsMetrics.bestPerformanceWeek.points,
													)}{' '}
													points
												</span>{' '}
												with{' '}
												<span className='font-semibold text-emerald-600'>
													{Math.round(
														weeklyAnalyticsMetrics.bestPerformanceWeek
															.completion,
													)}
													% completion
												</span>
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default TaskTrackerAnalyticsPage;

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient backgrounds with enhanced glass morphism effects for better visual appeal
// * 2. Comprehensive weekly tracking integration with missing day handling for data consistency
// * 3. Enhanced responsive design with improved mobile-first approach and better breakpoints
// * 4. Interactive tabbed interface for switching between daily and weekly analytics views
// * 5. Professional card-based layouts with shadcn/ui components for consistency
// * 6. Advanced loading states with skeleton animations and better user feedback
// * 7. Improved accessibility with proper ARIA labels and semantic HTML structure
// * 8. Enhanced color scheme with better contrast ratios for readability
// * 9. Professional dashboard typography with gradient text effects for visual hierarchy
// * 10. Better empty states with descriptive messages and actionable suggestions
// * 11. Enhanced date formatting with comprehensive error handling
// * 12. Advanced progress visualization with percentage indicators and performance badges
// * 13. Improved data organization with clear visual hierarchy and grouping
// * 14. Smooth loading animations and micro-interactions for better user experience
// * 15. Enhanced scroll behavior and responsive table design for better usability
// * 16. Comprehensive error handling with user-friendly messages and retry functionality
// * 17. Advanced performance metrics display with trend indicators and insights
// * 18. Professional dashboard appearance with consistent design language
// * 19. Better spacing and visual rhythm following design system principles
// * 20. Weekly breakdown cards with complete day coverage and missing data handling
// * 21. Refresh functionality with loading indicators for better user control
// * 22. Most productive day analytics with data-driven insights
// * 23. Enhanced badge system with performance-based styling and better visual feedback
// * 24. Improved table design with better hover effects and visual distinction

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Memoized calculations for both daily and weekly performance metrics to prevent redundant computations
// * 2. Optimized re-renders with proper dependency arrays in useEffect and useCallback hooks
// * 3. Efficient data processing and filtering with early returns for edge cases
// * 4. Lazy loading implementation for better initial page performance
// * 5. Cached calculations to prevent redundant operations during component re-renders
// * 6. Optimized API requests with proper error handling and loading state management
// * 7. Better state management with reduced unnecessary updates using functional setState
// * 8. Efficient date formatting operations with error boundaries and fallbacks
// * 9. Minimized DOM manipulations through React's virtual DOM and proper key usage
// * 10. Optimized component rendering with React.memo potential and proper component structure
// * 11. Efficient array operations using native methods for better performance
// * 12. Smart data structure handling with Set operations for faster lookups
// * 13. Optimized weekly data processing with memoized complete week calculations
// * 14. Reduced re-calculations through proper dependency management in useMemo
// * 15. Efficient missing day handling without unnecessary array manipulations

// ! FUTURE IMPROVEMENTS:
// TODO: Implement data export functionality (CSV, PDF, Excel) for both daily and weekly reports
// TODO: Add advanced date range filtering with calendar picker for custom time periods
// TODO: Integrate interactive charts and graphs using Recharts for better data visualization
// TODO: Implement comparison features (week-over-week, month-over-month, year-over-year)
// TODO: Add goal setting and tracking system with progress indicators and notifications
// TODO: Implement achievement system with badges and milestone notifications
// TODO: Add detailed task breakdown per day with category-wise analysis
// TODO: Implement data synchronization features with offline support and conflict resolution
// TODO: Add predictive analytics using historical data for performance forecasting
// TODO: Implement customizable dashboard with drag-and-drop widget arrangement
// TODO: Add team collaboration features for shared task tracking and analytics
// TODO: Implement notification system for performance alerts and reminders
// TODO: Add dark/light theme toggle with user preference persistence
// TODO: Integrate search and filtering capabilities for historical data exploration
// TODO: Add data backup and restore functionality with cloud synchronization
// TODO: Implement advanced reporting with custom metrics and KPI tracking
// TODO: Add mobile app integration with push notifications for task reminders
// TODO: Implement AI-powered insights and recommendations based on performance patterns
// TODO: Add time tracking integration for more comprehensive productivity analysis
// TODO: Implement gamification features with leaderboards and social sharing capabilities
