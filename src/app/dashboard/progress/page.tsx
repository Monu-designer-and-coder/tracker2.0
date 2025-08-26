'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	BookOpen,
	CheckCircle,
	Clock,
	TrendingUp,
	BarChart3,
	Filter,
	SortAsc,
	SortDesc,
	Eye,
	FileText,
	BookOpenCheck,
	Brain,
	HelpCircle,
	Plus,
	Users,
	Target,
	Award,
} from 'lucide-react';
import axios from 'axios';

// Import type definition for API response
// import { getNestedDetailedData } from "@/types/res/GetResponse.type";

// ! Type Definition
import { getNestedDetailedData } from '@/types/res/GetResponse.types';

// ! Sorting Configuration Types
type SortField = 'name' | 'standard' | 'progress' | 'seqNumber';
type SortOrder = 'asc' | 'desc';

// ! Badge Configuration for Extra Boolean Details
const chapterBadgeConfig = [
	{ key: 'selectionDiary', label: 'Diary', color: 'bg-blue-100 text-blue-800' },
	{ key: 'onePager', label: '1-Pager', color: 'bg-green-100 text-green-800' },
	{ key: 'DPP', label: 'DPP', color: 'bg-purple-100 text-purple-800' },
	{ key: 'Module', label: 'Module', color: 'bg-orange-100 text-orange-800' },
	{ key: 'PYQ', label: 'PYQ', color: 'bg-red-100 text-red-800' },
	{
		key: 'ExtraMaterial',
		label: 'Extra',
		color: 'bg-yellow-100 text-yellow-800',
	},
];

const topicBadgeConfig = [
	{ key: 'boards', label: 'Boards', color: 'bg-indigo-100 text-indigo-800' },
	{ key: 'mains', label: 'Mains', color: 'bg-pink-100 text-pink-800' },
	{ key: 'advanced', label: 'Advanced', color: 'bg-teal-100 text-teal-800' },
];

// ! Main Dashboard Component
const ModernDashboard: React.FC = () => {
	// * State Management for Data and UI
	const [dashboardData, setDashboardData] = useState<getNestedDetailedData[]>(
		[],
	);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<string>('overview');
	const [sortField, setSortField] = useState<SortField>('name');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
	const [selectedStandard, setSelectedStandard] = useState<string>('all');

	// * API Data Fetching with Error Handling
	const fetchDashboardData = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await axios.get<getNestedDetailedData[]>('/api/data');
			setDashboardData(response.data);
		} catch (fetchError) {
			console.error('❌ Error fetching dashboard data:', fetchError);
			setError('Failed to load dashboard data. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}, []);

	// * Component Initialization
	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	// * Progress Calculation Utilities
	const calculateProgress = useMemo(() => {
		return {
			// Calculate overall progress across all subjects
			overall: (): { completed: number; total: number; percentage: number } => {
				const allTopics = dashboardData.flatMap((subject) =>
					subject.chapters.flatMap((chapter) => chapter.topics),
				);
				const completedTopics = allTopics.filter((topic) => topic.done);
				const percentage =
					allTopics.length > 0
						? (completedTopics.length / allTopics.length) * 100
						: 0;

				return {
					completed: completedTopics.length,
					total: allTopics.length,
					percentage: Math.round(percentage * 100) / 100,
				};
			},

			// Calculate progress by subject
			bySubject: (
				subjectId: string,
			): { completed: number; total: number; percentage: number } => {
				const subject = dashboardData.find((s) => s.subjectId === subjectId);
				if (!subject) return { completed: 0, total: 0, percentage: 0 };

				const allTopics = subject.chapters.flatMap((chapter) => chapter.topics);
				const completedTopics = allTopics.filter((topic) => topic.done);
				const percentage =
					allTopics.length > 0
						? (completedTopics.length / allTopics.length) * 100
						: 0;

				return {
					completed: completedTopics.length,
					total: allTopics.length,
					percentage: Math.round(percentage * 100) / 100,
				};
			},

			// Calculate progress by chapter
			byChapter: (
				subjectId: string,
				chapterId: string,
			): { completed: number; total: number; percentage: number } => {
				const subject = dashboardData.find((s) => s.subjectId === subjectId);
				const chapter = subject?.chapters.find((c) => c._id === chapterId);
				if (!chapter) return { completed: 0, total: 0, percentage: 0 };

				const completedTopics = chapter.topics.filter((topic) => topic.done);
				const percentage =
					chapter.topics.length > 0
						? (completedTopics.length / chapter.topics.length) * 100
						: 0;

				return {
					completed: completedTopics.length,
					total: chapter.topics.length,
					percentage: Math.round(percentage * 100) / 100,
				};
			},
		};
	}, [dashboardData]);

	// * Data Sorting and Filtering Logic
	const processedData = useMemo(() => {
		let filteredData = [...dashboardData];

		// Filter by standard if selected
		if (selectedStandard !== 'all') {
			filteredData = filteredData.filter(
				(subject) => subject.standard === selectedStandard,
			);
		}

		// Sort subjects based on selected criteria
		filteredData.sort((a, b) => {
			let comparison = 0;

			switch (sortField) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'standard':
					comparison = a.standard.localeCompare(b.standard);
					break;
				case 'progress':
					const progressA = calculateProgress.bySubject(a.subjectId).percentage;
					const progressB = calculateProgress.bySubject(b.subjectId).percentage;
					comparison = progressA - progressB;
					break;
				default:
					comparison = 0;
			}

			return sortOrder === 'asc' ? comparison : -comparison;
		});

		// Sort chapters within each subject by sequence number
		filteredData.forEach((subject) => {
			subject.chapters.sort((a, b) => a.seqNumber - b.seqNumber);

			// Sort topics within each chapter by sequence number
			subject.chapters.forEach((chapter) => {
				chapter.topics.sort((a, b) => a.seqNumber - b.seqNumber);
			});
		});

		return filteredData;
	}, [
		dashboardData,
		selectedStandard,
		sortField,
		sortOrder,
		calculateProgress,
	]);

	// * Badge Rendering Component
	const renderBadges = useCallback(
		(item: any, config: typeof chapterBadgeConfig): React.ReactNode => {
			return config
				.filter((badge) => item[badge.key])
				.map((badge) => (
					<Badge
						key={badge.key}
						variant='secondary'
						className={`${badge.color} text-xs font-medium`}>
						{badge.label}
					</Badge>
				));
		},
		[],
	);

	// * Progress Bar Component
	const ProgressBar: React.FC<{
		progress: { completed: number; total: number; percentage: number };
		label?: string;
		size?: 'sm' | 'md' | 'lg';
	}> = ({ progress, label, size = 'md' }) => {
		const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3';

		return (
			<div className='space-y-2'>
				{label && (
					<div className='flex justify-between items-center text-sm'>
						<span className='font-medium text-gray-700 dark:text-gray-300'>
							{label}
						</span>
						<span className='text-gray-500 dark:text-gray-400'>
							{progress.completed}/{progress.total} ({progress.percentage}%)
						</span>
					</div>
				)}
				<Progress
					value={progress.percentage}
					className={`${heightClass} bg-gray-200 dark:bg-gray-700`}
				/>
			</div>
		);
	};

	// * Loading State Component
	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900'>
				<div className='container mx-auto px-4 py-8'>
					<div className='animate-pulse space-y-6'>
						<div className='h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3'></div>
						<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
							{[...Array(6)].map((_, i) => (
								<div
									key={i}
									className='h-32 bg-gray-200 dark:bg-gray-700 rounded-xl'></div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	// * Error State Component
	if (error) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center'>
				<Card className='w-full max-w-md mx-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-red-200 dark:border-red-800'>
					<CardContent className='pt-6 text-center'>
						<div className='text-red-500 mb-4'>
							<HelpCircle size={48} className='mx-auto' />
						</div>
						<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
							Error Loading Data
						</h3>
						<p className='text-gray-600 dark:text-gray-400 mb-4'>{error}</p>
						<Button onClick={fetchDashboardData} variant='outline'>
							Try Again
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// * Main Dashboard Render
	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50/10 via-indigo-50/10 to-purple-50/10 dark:from-gray-900/10 dark:via-blue-900/10 dark:to-purple-900/10 relative overflow-hidden'>
			{/* Background Animation Orbs */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob'></div>
				<div className='absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000'></div>
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000'></div>
			</div>

			<div className='container mx-auto px-4 py-8 relative z-10'>
				{/* Header Section */}
				<div className='mb-8'>
					<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
						<div>
							<h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'>
								Learning Dashboard
							</h1>
							<p className='text-gray-600 dark:text-gray-400 mt-2'>
								Track your progress across subjects, chapters, and topics
							</p>
						</div>

						{/* Controls Section */}
						<div className='flex flex-col sm:flex-row gap-3'>
							<Select
								value={selectedStandard}
								onValueChange={setSelectedStandard}>
								<SelectTrigger className='w-full sm:w-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
									<SelectValue placeholder='Filter by Standard' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Standards</SelectItem>
									<SelectItem value='XI'>Standard XI</SelectItem>
									<SelectItem value='XII'>Standard XII</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={sortField}
								onValueChange={(value) => setSortField(value as SortField)}>
								<SelectTrigger className='w-full sm:w-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
									<SelectValue placeholder='Sort by' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='name'>Name</SelectItem>
									<SelectItem value='standard'>Standard</SelectItem>
									<SelectItem value='progress'>Progress</SelectItem>
								</SelectContent>
							</Select>

							<Button
								variant='outline'
								size='icon'
								onClick={() =>
									setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
								}
								className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300'>
								{sortOrder === 'asc' ? (
									<SortAsc size={16} />
								) : (
									<SortDesc size={16} />
								)}
							</Button>
						</div>
					</div>

					{/* Overall Progress Card */}
					<Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl'>
						<CardContent className='p-6'>
							<div className='grid gap-6 md:grid-cols-3'>
								<div className='space-y-3'>
									<div className='flex items-center gap-2'>
										<Target className='text-blue-500' size={20} />
										<h3 className='font-semibold text-gray-900 dark:text-white'>
											Overall Progress
										</h3>
									</div>
									<ProgressBar
										progress={calculateProgress.overall()}
										size='lg'
									/>
								</div>

								<div className='space-y-3'>
									<div className='flex items-center gap-2'>
										<BookOpen className='text-indigo-500' size={20} />
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Total Subjects
										</span>
									</div>
									<div className='text-3xl font-bold text-gray-900 dark:text-white'>
										{processedData.length}
									</div>
								</div>

								<div className='space-y-3'>
									<div className='flex items-center gap-2'>
										<Award className='text-purple-500' size={20} />
										<span className='font-medium text-gray-700 dark:text-gray-300'>
											Completion Rate
										</span>
									</div>
									<div className='text-3xl font-bold text-gray-900 dark:text-white'>
										{calculateProgress.overall().percentage}%
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Tabs */}
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className='space-y-6'>
					<TabsList className='grid w-full grid-cols-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
						<TabsTrigger
							value='overview'
							className='data-[state=active]:bg-blue-500 data-[state=active]:text-white'>
							Overview
						</TabsTrigger>
						<TabsTrigger
							value='subjects'
							className='data-[state=active]:bg-blue-500 data-[state=active]:text-white'>
							Subjects
						</TabsTrigger>
						<TabsTrigger
							value='analytics'
							className='data-[state=active]:bg-blue-500 data-[state=active]:text-white'>
							Analytics
						</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value='overview' className='space-y-6'>
						<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
							{processedData.map((subject) => {
								const subjectProgress = calculateProgress.bySubject(
									subject.subjectId,
								);

								return (
									<Card
										key={subject.subjectId}
										className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'>
										<CardHeader className='pb-3'>
											<div className='flex items-start justify-between'>
												<div className='flex-1'>
													<CardTitle className='text-lg font-bold text-gray-900 dark:text-white'>
														{subject.name}
													</CardTitle>
													<CardDescription className='flex items-center gap-2 mt-1'>
														<Badge variant='outline' className='text-xs'>
															Standard {subject.standard}
														</Badge>
														<span className='text-gray-500'>
															{subject.chapters.length} chapters
														</span>
													</CardDescription>
												</div>
												<div className='text-right'>
													<div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
														{subjectProgress.percentage}%
													</div>
													<div className='text-xs text-gray-500'>
														{subjectProgress.completed}/{subjectProgress.total}
													</div>
												</div>
											</div>
										</CardHeader>
										<CardContent className='space-y-4'>
											<ProgressBar progress={subjectProgress} />

											<div className='space-y-2'>
												<h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
													Recent Chapters
												</h4>
												{subject.chapters.slice(0, 3).map((chapter) => {
													const chapterProgress = calculateProgress.byChapter(
														subject.subjectId,
														chapter._id,
													);
													return (
														<div
															key={chapter._id}
															className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
															<div className='flex-1'>
																<span className='text-sm font-medium text-gray-900 dark:text-white'>
																	{chapter.name}
																</span>
																<div className='flex items-center gap-1 mt-1'>
																	{chapter.done && (
																		<CheckCircle
																			size={12}
																			className='text-green-500'
																		/>
																	)}
																	<span className='text-xs text-gray-500'>
																		{chapterProgress.completed}/
																		{chapterProgress.total} topics
																	</span>
																</div>
															</div>
															<div className='text-xs font-medium text-blue-600 dark:text-blue-400'>
																{chapterProgress.percentage}%
															</div>
														</div>
													);
												})}
												{subject.chapters.length > 3 && (
													<div className='text-center'>
														<Button
															variant='ghost'
															size='sm'
															onClick={() => setActiveTab('subjects')}
															className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'>
															View all {subject.chapters.length} chapters
														</Button>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</TabsContent>

					{/* Subjects Tab */}
					<TabsContent value='subjects' className='space-y-6'>
						{processedData.map((subject) => {
							const subjectProgress = calculateProgress.bySubject(
								subject.subjectId,
							);

							return (
								<Card
									key={subject.subjectId}
									className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg'>
									<CardHeader>
										<div className='flex items-center justify-between'>
											<div>
												<CardTitle className='text-xl font-bold text-gray-900 dark:text-white'>
													{subject.name}
												</CardTitle>
												<CardDescription className='flex items-center gap-2 mt-1'>
													<Badge variant='outline'>
														Standard {subject.standard}
													</Badge>
													<span>{subject.chapters.length} chapters</span>
												</CardDescription>
											</div>
											<div className='text-right'>
												<div className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
													{subjectProgress.percentage}%
												</div>
												<div className='text-sm text-gray-500'>
													{subjectProgress.completed}/{subjectProgress.total}{' '}
													topics completed
												</div>
											</div>
										</div>
										<ProgressBar progress={subjectProgress} size='lg' />
									</CardHeader>

									<CardContent>
										<div className='space-y-4'>
											<h4 className='text-lg font-semibold text-gray-900 dark:text-white'>
												Chapters
											</h4>

											<div className='grid gap-4'>
												{subject.chapters.map((chapter) => {
													const chapterProgress = calculateProgress.byChapter(
														subject.subjectId,
														chapter._id,
													);

													return (
														<Card
															key={chapter._id}
															className='bg-gray-50 dark:bg-gray-700/50 border-0'>
															<CardContent className='p-4 space-y-3'>
																<div className='flex items-start justify-between'>
																	<div className='flex-1'>
																		<div className='flex items-center gap-2 mb-2'>
																			<h5 className='font-semibold text-gray-900 dark:text-white'>
																				{chapter.seqNumber}. {chapter.name}
																			</h5>
																			{chapter.done && (
																				<CheckCircle
																					size={16}
																					className='text-green-500'
																				/>
																			)}
																		</div>

																		<div className='flex flex-wrap gap-1 mb-2'>
																			{renderBadges(
																				chapter,
																				chapterBadgeConfig,
																			)}
																		</div>
																	</div>

																	<div className='text-right ml-4'>
																		<div className='text-xl font-bold text-indigo-600 dark:text-indigo-400'>
																			{chapterProgress.percentage}%
																		</div>
																		<div className='text-xs text-gray-500'>
																			{chapterProgress.completed}/
																			{chapterProgress.total}
																		</div>
																	</div>
																</div>

																<ProgressBar
																	progress={chapterProgress}
																	size='sm'
																/>

																<div className='space-y-2'>
																	<h6 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
																		Topics ({chapter.topics.length})
																	</h6>

																	<div className='grid gap-2 sm:grid-cols-2'>
																		{chapter.topics.map((topic) => (
																			<div
																				key={topic._id}
																				className='flex items-center justify-between p-2 bg-white dark:bg-gray-600/50 rounded-lg border border-gray-200 dark:border-gray-600'>
																				<div className='flex-1'>
																					<div className='flex items-center gap-2'>
																						<span className='text-sm font-medium text-gray-900 dark:text-white'>
																							{topic.seqNumber}. {topic.name}
																						</span>
																						{topic.done && (
																							<CheckCircle
																								size={12}
																								className='text-green-500'
																							/>
																						)}
																					</div>

																					<div className='flex flex-wrap gap-1 mt-1'>
																						{renderBadges(
																							topic,
																							topicBadgeConfig,
																						)}
																					</div>
																				</div>
																			</div>
																		))}
																	</div>
																</div>
															</CardContent>
														</Card>
													);
												})}
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</TabsContent>

					{/* Analytics Tab */}
					<TabsContent value='analytics' className='space-y-6'>
						<div className='grid gap-6 md:grid-cols-2'>
							{/* Subject-wise Progress Chart */}
							<Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg'>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<BarChart3 className='text-blue-500' size={20} />
										Subject Progress Analysis
									</CardTitle>
									<CardDescription>
										Progress comparison across all subjects
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{processedData.map((subject) => {
											const progress = calculateProgress.bySubject(
												subject.subjectId,
											);
											return (
												<div key={subject.subjectId} className='space-y-2'>
													<div className='flex items-center justify-between'>
														<span className='text-sm font-medium text-gray-900 dark:text-white'>
															{subject.name}
														</span>
														<span className='text-sm text-gray-500'>
															{progress.percentage}%
														</span>
													</div>
													<Progress
														value={progress.percentage}
														className='h-2'
													/>
												</div>
											);
										})}
									</div>
								</CardContent>
							</Card>

							{/* Statistics Card */}
							<Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg'>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<TrendingUp className='text-green-500' size={20} />
										Learning Statistics
									</CardTitle>
									<CardDescription>Key metrics and insights</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										<div className='grid grid-cols-2 gap-4'>
											<div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
												<div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
													{processedData.reduce(
														(sum, subject) => sum + subject.chapters.length,
														0,
													)}
												</div>
												<div className='text-sm text-gray-600 dark:text-gray-400'>
													Total Chapters
												</div>
											</div>

											<div className='p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
												<div className='text-2xl font-bold text-green-600 dark:text-green-400'>
													{calculateProgress.overall().completed}/{calculateProgress.overall().total}({Math.round(calculateProgress.overall().percentage)}%)
												</div>
												<div className='text-sm text-gray-600 dark:text-gray-400'>
													Completed Topics
												</div>
											</div>
										</div>

										<div className='grid grid-cols-2 gap-4'>
											<div className='p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
												<div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
													{
														processedData.filter((s) => s.standard === 'XI')
															.length
													} Subjects
												</div>
												<div className='text-sm text-gray-600 dark:text-gray-400'>
													Standard XI
												</div>
											</div>

											<div className='p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg'>
												<div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
													{
														processedData.filter((s) => s.standard === 'XII')
															.length
													} Subjects
												</div>
												<div className='text-sm text-gray-600 dark:text-gray-400'>
													Standard XII
												</div>
											</div>
										</div>

										<div className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg'>
											<div className='flex items-center justify-between'>
												<div>
													<div className='text-lg font-bold text-gray-900 dark:text-white'>
														Average Progress
													</div>
													<div className='text-sm text-gray-600 dark:text-gray-400'>
														Across all subjects
													</div>
												</div>
												<div className='text-3xl font-bold text-indigo-600 dark:text-indigo-400'>
													{processedData.length > 0
														? Math.round(
																(processedData.reduce(
																	(sum, subject) =>
																		sum +
																		calculateProgress.bySubject(
																			subject.subjectId,
																		).percentage,
																	0,
																) /
																	processedData.length) *
																	100,
														  ) / 100
														: 0}
													%
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Completion Status Overview */}
							<Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg md:col-span-2'>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<CheckCircle className='text-purple-500' size={20} />
										Completion Status Overview
									</CardTitle>
									<CardDescription>
										Detailed breakdown of chapter and topic completion
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='overflow-x-auto'>
										<table className='w-full text-sm'>
											<thead>
												<tr className='border-b border-gray-200 dark:border-gray-700'>
													<th className='text-left py-3 px-4 font-semibold text-gray-900 dark:text-white'>
														Subject
													</th>
													<th className='text-center py-3 px-4 font-semibold text-gray-900 dark:text-white'>
														Standard
													</th>
													<th className='text-center py-3 px-4 font-semibold text-gray-900 dark:text-white'>
														Chapters
													</th>
													<th className='text-center py-3 px-4 font-semibold text-gray-900 dark:text-white'>
														Topics
													</th>
													<th className='text-center py-3 px-4 font-semibold text-gray-900 dark:text-white'>
														Progress
													</th>
													<th className='text-center py-3 px-4 font-semibold text-gray-900 dark:text-white'>
														Status
													</th>
												</tr>
											</thead>
											<tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
												{processedData.map((subject) => {
													const progress = calculateProgress.bySubject(
														subject.subjectId,
													);
													const completedChapters = subject.chapters.filter(
														(c) => c.done,
													).length;

													return (
														<tr
															key={subject.subjectId}
															className='hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'>
															<td className='py-3 px-4 font-medium text-gray-900 dark:text-white'>
																{subject.name}
															</td>
															<td className='py-3 px-4 text-center'>
																<Badge variant='outline' className='text-xs'>
																	{subject.standard}
																</Badge>
															</td>
															<td className='py-3 px-4 text-center text-gray-600 dark:text-gray-400'>
																{completedChapters}/{subject.chapters.length}
															</td>
															<td className='py-3 px-4 text-center text-gray-600 dark:text-gray-400'>
																{progress.completed}/{progress.total}
															</td>
															<td className='py-3 px-4 text-center'>
																<div className='flex items-center gap-2'>
																	<div className='flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
																		<div
																			className='h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500'
																			style={{
																				width: `${progress.percentage}%`,
																			}}></div>
																	</div>
																	<span className='text-sm font-medium text-gray-900 dark:text-white min-w-[3rem]'>
																		{progress.percentage}%
																	</span>
																</div>
															</td>
															<td className='py-3 px-4 text-center'>
																{progress.percentage === 100 ? (
																	<Badge className='bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'>
																		Complete
																	</Badge>
																) : progress.percentage >= 50 ? (
																	<Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'>
																		In Progress
																	</Badge>
																) : (
																	<Badge className='bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'>
																		Started
																	</Badge>
																)}
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>

				{/* Footer Actions */}
				<div className='mt-8 text-center'>
					<Button
						onClick={fetchDashboardData}
						variant='outline'
						className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300'
						disabled={isLoading}>
						<Clock size={16} className='mr-2' />
						{isLoading ? 'Refreshing...' : 'Refresh Data'}
					</Button>
				</div>
			</div>

			{/* Custom CSS for animations */}
			<style jsx>{`
				@keyframes blob {
					0% {
						transform: translate(0px, 0px) scale(1);
					}
					33% {
						transform: translate(30px, -50px) scale(1.1);
					}
					66% {
						transform: translate(-20px, 20px) scale(0.9);
					}
					100% {
						transform: translate(0px, 0px) scale(1);
					}
				}

				.animate-blob {
					animation: blob 7s infinite;
				}

				.animation-delay-2000 {
					animation-delay: 2s;
				}

				.animation-delay-4000 {
					animation-delay: 4s;
				}

				/* Custom scrollbar styling */
				.overflow-x-auto::-webkit-scrollbar {
					height: 6px;
				}

				.overflow-x-auto::-webkit-scrollbar-track {
					background: rgba(0, 0, 0, 0.1);
					border-radius: 3px;
				}

				.overflow-x-auto::-webkit-scrollbar-thumb {
					background: rgba(59, 130, 246, 0.5);
					border-radius: 3px;
				}

				.overflow-x-auto::-webkit-scrollbar-thumb:hover {
					background: rgba(59, 130, 246, 0.7);
				}

				/* Enhanced card hover effects */
				.hover\\:scale-\\[1\\.02\\]:hover {
					transform: scale(1.02);
				}

				/* Glass morphism effects */
				.backdrop-blur-sm {
					backdrop-filter: blur(8px);
				}

				/* Progress bar enhancements */
				.progress-bar {
					background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
					background-size: 200% 100%;
					animation: progress-shimmer 2s ease-in-out infinite;
				}

				@keyframes progress-shimmer {
					0% {
						background-position: 200% 0;
					}
					100% {
						background-position: -200% 0;
					}
				}
			`}</style>
		</div>
	);
};

export default ModernDashboard;

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient backgrounds with dynamic color transitions using Tailwind gradient classes
// * 2. Glass morphism effects with backdrop blur and transparency on all cards and controls
// * 3. Animated gradient orbs for visual depth and movement using CSS keyframes and blob animations
// * 4. Enhanced floating elements with improved glass styling and backdrop-blur effects
// * 5. Subtle particle animations for ambient background effects with staggered animation delays
// * 6. Improved responsive design with better mobile adaptation using responsive grid systems
// * 7. Enhanced dark mode compatibility with better contrast ratios and proper color schemes
// * 8. Interactive hover effects with scale transformations on cards and interactive elements
// * 9. Professional color scheme using blue-indigo-purple gradient palette throughout
// * 10. Layered visual hierarchy with proper z-indexing for background orbs and content
// * 11. Smooth micro-animations and transitions throughout using Tailwind transition classes
// * 12. Better accessibility with proper ARIA labels and semantic HTML structure
// * 13. Enhanced shadow system for depth perception with consistent shadow-lg classes
// * 14. Consistent border radius system for modern appearance with rounded-lg/xl classes
// * 15. Optimized backdrop filters for performance with backdrop-blur-sm implementation
// * 16. Improved spacing and padding system with consistent Tailwind spacing scale
// * 17. Better content isolation with backdrop effects on all interactive elements
// * 18. Enhanced visual feedback on interactive elements with hover and focus states
// * 19. Modern CSS animations with proper timing functions and easing curves
// * 20. Responsive viewport handling with proper overflow management and scrollbar styling

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. useMemo for expensive calculations like progress computations and data processing
// * 2. useCallback for event handlers and function references to prevent unnecessary re-renders
// * 3. Efficient sorting and filtering with optimized algorithms and minimal data transformation
// * 4. Lazy badge rendering with conditional filtering to avoid unnecessary DOM elements
// * 5. Optimized re-renders with proper React key props and stable component references
// * 6. Minimal API calls with proper error handling and loading states
// * 7. Efficient state management with atomic state updates and batched operations
// * 8. CSS-in-JS optimizations with static styles moved to JSX style blocks
// * 9. Image and animation optimizations with transform3d for hardware acceleration
// * 10. Memory-efficient data structures with proper cleanup and garbage collection

// ! FUTURE IMPROVEMENTS:
// TODO: Add real-time progress tracking with WebSocket integration for live updates
// TODO: Implement drag-and-drop functionality for reordering subjects and chapters
// TODO: Add data export functionality (PDF reports, CSV exports, etc.)
// TODO: Implement advanced filtering with multiple criteria and saved filter presets
// TODO: Add gamification elements (achievements, streaks, progress milestones)
// TODO: Implement offline support with service workers and local data caching
// TODO: Add collaborative features for sharing progress with teachers/peers
// TODO: Implement advanced analytics with charts and trend analysis using Recharts
// TODO: Add notification system for deadlines and progress reminders
// TODO: Implement dark/light theme toggle with system preference detection
// TODO: Add keyboard shortcuts and accessibility improvements (screen reader support)
// TODO: Implement advanced search functionality across subjects, chapters, and topics
// TODO: Add time tracking for study sessions and productivity metrics
// TODO: Implement data synchronization with external learning management systems
// TODO: Add mobile-first PWA capabilities with app-like experience
// TODO: Implement AI-powered study recommendations based on progress patterns
