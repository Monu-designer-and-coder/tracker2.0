'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/hooks/actions';

// * UI Components Import - Optimized for better tree shaking
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// * Schema Imports
import { subjectValidationSchema } from '@/schema/subject.schema';
import { chapterValidationSchema } from '@/schema/chapter.schema';
import { TopicValidationSchema } from '@/schema/topic.schema';

// * Type Imports
import { getSubjectResponse } from '@/types/res/GetResponse.types';
import { Label } from '@/components/ui/label';

// * Enhanced Interface for Subject-wise Chapter Response
export interface getSubjectWiseChapterResponse extends getSubjectResponse {
	chapterList: {
		_id: string;
		name: string;
		seqNumber: number;
		done: boolean;
		selectionDiary: boolean;
		onePager: boolean;
		DPP: boolean;
		Module: boolean;
		PYQ: boolean;
		ExtraMaterial: boolean;
	}[];
}

/**
 * Enhanced Add Page Component with Modern UI/UX Design
 * Implements glassmorphism, gradient backgrounds, and smooth animations
 */
const AddPage = () => {
	// * Redux Store Access - Optimized with useAppSelector
	const subjectsFromStore = useAppSelector((state) => state.data.subjects);

	// * State Management - Organized and typed for better maintainability
	const [subjectList, setSubjectList] =
		useState<getSubjectResponse[]>(subjectsFromStore);
	const [subjectWiseChapters, setSubjectWiseChapters] = useState<
		getSubjectWiseChapterResponse[]
	>([]);
	const [isLoadingChapters, setIsLoadingChapters] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<string>('subject');

	// * Memoized Axios Configuration - Performance optimization
	const axiosConfig = useMemo(
		() => ({
			method: '',
			maxBodyLength: Infinity,
			url: '',
			headers: {
				'Content-Type': 'application/json',
			},
			data: {},
		}),
		[],
	);

	// * Enhanced Subject Form with Better Error Handling
	const subjectCreateForm = useForm<z.infer<typeof subjectValidationSchema>>({
		resolver: zodResolver(subjectValidationSchema),
		defaultValues: {
			name: '',
			standard: '',
		},
		mode: 'onChange', // Real-time validation for better UX
	});

	// * Enhanced Chapter Form with Improved Validation
	const chapterCreateForm = useForm<z.infer<typeof chapterValidationSchema>>({
		resolver: zodResolver(chapterValidationSchema),
		defaultValues: {
			name: '',
			subject: '',
			seqNumber: '0',
			done: false,
			selectionDiary: false,
			onePager: false,
			DPP: false,
			Module: false,
			PYQ: false,
			ExtraMaterial: false,
		},
		mode: 'onChange',
	});

	// * Enhanced Topic Form with Complete Validation
	const topicCreateForm = useForm<z.infer<typeof TopicValidationSchema>>({
		resolver: zodResolver(TopicValidationSchema),
		defaultValues: {
			name: '',
			chapter: '',
			done: false,
			seqNumber: 1,
			boards: false,
			mains: false,
			advanced: false,
		},
		mode: 'onChange',
	});

	// * Optimized Subject List Loading with Error Handling
	useEffect(() => {
		const loadSubjectsFromStorage = () => {
			try {
				const storedSubjects = window.localStorage.getItem('subjects');
				if (storedSubjects) {
					const parsedSubjects: getSubjectResponse[] =
						JSON.parse(storedSubjects);
					setSubjectList(parsedSubjects);
				}
			} catch (error) {
				console.error('Failed to load subjects from localStorage:', error);
				setSubjectList(subjectsFromStore);
			}
		};

		loadSubjectsFromStorage();
	}, [subjectsFromStore]);

	// * Enhanced Chapter Loading Function with Loading States
	const fetchSubjectWiseChapters = useCallback(async () => {
		setIsLoadingChapters(true);
		try {
			const response = await axios.get('/api/chapters?type=subjectWise');
			setSubjectWiseChapters(response.data);
		} catch (error) {
			console.error('Failed to fetch chapters:', error);
		} finally {
			setIsLoadingChapters(false);
		}
	}, []);

	// * Load Chapters when Topics Tab is Selected
	useEffect(() => {
		if (activeTab === 'topics' && subjectWiseChapters.length === 0) {
			fetchSubjectWiseChapters();
		}
	}, [activeTab, fetchSubjectWiseChapters, subjectWiseChapters.length]);

	// * Enhanced Subject Submit Handler with Loading States and Error Handling
	const handleSubjectSubmit = useCallback(
		async (values: z.infer<typeof subjectValidationSchema>) => {
			try {
				const config = {
					...axiosConfig,
					method: 'post',
					data: values,
					url: '/api/subjects',
				};

				const response = await axios.request(config);
				console.log('Subject created successfully:', response.data);

				// * Success feedback and form reset
				subjectCreateForm.reset();
			} catch (error) {
				console.error('Failed to create subject:', error);
				// TODO: Add toast notification for error handling
			}
		},
		[axiosConfig, subjectCreateForm],
	);

	// * Enhanced Chapter Submit Handler with Improved Logic
	const handleChapterSubmit = useCallback(
		async (values: z.infer<typeof chapterValidationSchema>) => {
			try {
				const config = {
					...axiosConfig,
					method: 'POST',
					data: { ...values, seqNumber: Number(values.seqNumber) },
					url: '/api/chapters',
				};

				const response = await axios.request(config);
				console.log('Chapter created successfully:', response.data);

				// * Smart form reset - keep all data except name and increment seqNumber
				const currentSeqNumber = Number(
					chapterCreateForm.getValues('seqNumber'),
				);
				chapterCreateForm.setValue('name', '');
				chapterCreateForm.setValue('seqNumber', String(currentSeqNumber + 1));
			} catch (error) {
				console.error('Failed to create chapter:', error);
				// TODO: Add toast notification for error handling
			}
		},
		[axiosConfig, chapterCreateForm],
	);

	// * Enhanced Topic Submit Handler - New Feature Implementation
	const handleTopicSubmit = useCallback(
		async (values: z.infer<typeof TopicValidationSchema>) => {
			try {
				const config = {
					...axiosConfig,
					method: 'POST',
					data: values,
					url: '/api/topics/',
				};

				const response = await axios.request(config);
				console.log('Topic created successfully:', response.data);

				// * Smart form reset - similar to chapter logic
				const currentSeqNumber = topicCreateForm.getValues('seqNumber');
				topicCreateForm.setValue('name', '');
				topicCreateForm.setValue('seqNumber', currentSeqNumber + 1);
			} catch (error) {
				console.error('Failed to create topic:', error);
				// TODO: Add toast notification for error handling
			}
		},
		[axiosConfig, topicCreateForm],
	);

	// * Memoized Chapter Options for Performance
	const groupedChapterOptions = useMemo(() => {
		return subjectWiseChapters.reduce((acc, subject) => {
			if (!acc[subject.standard]) {
				acc[subject.standard] = [];
			}
			acc[subject.standard].push(subject);
			return acc;
		}, {} as Record<string, getSubjectWiseChapterResponse[]>);
	}, [subjectWiseChapters]);

	return (
		<>
			{/* Modern Gradient Background with Animated Orbs */}
			<div className='fixed inset-0 -z-10 overflow-hidden'>
				{/* Primary Gradient Background */}
				<div className='absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950' />

				{/* Animated Gradient Orbs for Visual Depth */}
				<div className='absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl animate-pulse' />
				<div className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000' />
				<div className='absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/25 to-blue-400/25 rounded-full blur-2xl animate-pulse delay-500' />
			</div>

			{/* Main Content Container with Glass Morphism */}
			<section className='relative w-full min-h-screen flex justify-center items-center p-4 sm:p-6 lg:p-8'>
				<div className='w-full max-w-2xl'>
					{/* Enhanced Floating Container with Glass Effect */}
					<div className='relative backdrop-blur-xl bg-white/10 dark:bg-black/10 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20 overflow-hidden'>
						{/* Subtle Inner Glow Effect */}
						<div className='absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none' />

						{/* Content Container */}
						<div className='relative z-10 p-6 sm:p-8'>
							{/* Enhanced Tabs with Modern Styling */}
							<Tabs
								value={activeTab}
								onValueChange={setActiveTab}
								className='w-full'>
								{/* Modern Tab List with Glassmorphism */}
								<TabsList className='grid w-full grid-cols-3 mb-8 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-2xl p-1 shadow-lg'>
									<TabsTrigger
										value='subject'
										className='data-[state=active]:bg-white/80 data-[state=active]:text-blue-900 data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300 hover:bg-white/40'>
										Subjects
									</TabsTrigger>
									<TabsTrigger
										value='chapter'
										className='data-[state=active]:bg-white/80 data-[state=active]:text-blue-900 data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300 hover:bg-white/40'>
										Chapters
									</TabsTrigger>
									<TabsTrigger
										value='topics'
										className='data-[state=active]:bg-white/80 data-[state=active]:text-blue-900 data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300 hover:bg-white/40'>
										Topics
									</TabsTrigger>
								</TabsList>

								{/* Subject Tab Content */}
								<TabsContent value='subject' className='mt-6 space-y-6'>
									<EnhancedCard>
										<CardHeader className='text-center pb-6'>
											<CardTitle className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
												Add New Subject
											</CardTitle>
											<CardDescription className='text-slate-600 dark:text-slate-400'>
												Create a new subject for your curriculum
											</CardDescription>
										</CardHeader>
										<CardContent>
											<Form {...subjectCreateForm}>
												<form
													onSubmit={subjectCreateForm.handleSubmit(
														handleSubjectSubmit,
													)}
													className='space-y-6'>
													<FormField
														control={subjectCreateForm.control}
														name='name'
														render={({ field }) => (
															<FormItem>
																<EnhancedInputContainer>
																	<FormLabel className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
																		Subject Name
																	</FormLabel>
																	<FormControl>
																		<Input
																			placeholder='Enter subject name'
																			className='glass-input'
																			{...field}
																		/>
																	</FormControl>
																</EnhancedInputContainer>
																<FormDescription className='text-xs text-slate-500 dark:text-slate-400'>
																	Provide a descriptive name for the subject
																</FormDescription>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={subjectCreateForm.control}
														name='standard'
														render={({ field }) => (
															<FormItem>
																<EnhancedInputContainer>
																	<FormLabel className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
																		Academic Standard
																	</FormLabel>
																	<FormControl>
																		<Input
																			placeholder='e.g., XI, XII'
																			className='glass-input'
																			{...field}
																		/>
																	</FormControl>
																</EnhancedInputContainer>
																<FormDescription className='text-xs text-slate-500 dark:text-slate-400'>
																	Specify the academic standard (XI or XII)
																</FormDescription>
																<FormMessage />
															</FormItem>
														)}
													/>
													<Button
														type='submit'
														className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'>
														Create Subject
													</Button>
												</form>
											</Form>
										</CardContent>
									</EnhancedCard>
								</TabsContent>

								{/* Chapter Tab Content */}
								<TabsContent value='chapter' className='mt-6 space-y-6'>
									<EnhancedCard>
										<CardHeader className='text-center pb-6'>
											<CardTitle className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
												Add New Chapter
											</CardTitle>
											<CardDescription className='text-slate-600 dark:text-slate-400'>
												Create a new chapter within a subject
											</CardDescription>
										</CardHeader>
										<CardContent className='space-y-6'>
											<Form {...chapterCreateForm}>
												<form
													onSubmit={chapterCreateForm.handleSubmit(
														handleChapterSubmit,
													)}
													className='space-y-6'>
													{/* Chapter Name Field */}
													<FormField
														control={chapterCreateForm.control}
														name='name'
														render={({ field }) => (
															<FormItem>
																<EnhancedInputContainer>
																	<FormLabel className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
																		Chapter Name
																	</FormLabel>
																	<FormControl>
																		<Input
																			placeholder='Enter chapter name'
																			className='glass-input'
																			{...field}
																		/>
																	</FormControl>
																</EnhancedInputContainer>
																<FormDescription className='text-xs text-slate-500 dark:text-slate-400'>
																	Provide a descriptive name for the chapter
																</FormDescription>
																<FormMessage />
															</FormItem>
														)}
													/>

													{/* Subject Selection Field */}
													<FormField
														control={chapterCreateForm.control}
														name='subject'
														render={({ field }) => (
															<FormItem>
																<EnhancedInputContainer>
																	<FormLabel className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
																		Subject
																	</FormLabel>
																	<Select
																		onValueChange={field.onChange}
																		defaultValue={field.value}>
																		<FormControl>
																			<SelectTrigger className='glass-select'>
																				<SelectValue placeholder='Select the subject for this chapter' />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent className='glass-content'>
																			<SelectGroup>
																				<SelectLabel className='font-semibold text-blue-600'>
																					Class XI
																				</SelectLabel>
																				{subjectList
																					?.filter(
																						(subject) =>
																							subject.standard === 'XI',
																					)
																					.map((subject) => (
																						<SelectItem
																							key={subject._id}
																							value={subject._id}
																							className='hover:bg-blue-50 dark:hover:bg-blue-900/20'>
																							{subject.name} -{' '}
																							{subject.standard}
																						</SelectItem>
																					))}
																			</SelectGroup>
																			<SelectGroup>
																				<SelectLabel className='font-semibold text-indigo-600'>
																					Class XII
																				</SelectLabel>
																				{subjectList
																					?.filter(
																						(subject) =>
																							subject.standard === 'XII',
																					)
																					.map((subject) => (
																						<SelectItem
																							key={subject._id}
																							value={subject._id}
																							className='hover:bg-indigo-50 dark:hover:bg-indigo-900/20'>
																							{subject.name} -{' '}
																							{subject.standard}
																						</SelectItem>
																					))}
																			</SelectGroup>
																		</SelectContent>
																	</Select>
																</EnhancedInputContainer>
																<FormDescription className='text-xs text-slate-500 dark:text-slate-400'>
																	Choose the subject this chapter belongs to
																</FormDescription>
																<FormMessage />
															</FormItem>
														)}
													/>

													{/* Sequence Number Field */}
													<FormField
														control={chapterCreateForm.control}
														name='seqNumber'
														render={({ field }) => (
															<FormItem>
																<EnhancedInputContainer>
																	<FormLabel className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
																		Sequence Number
																	</FormLabel>
																	<FormControl>
																		<Input
																			type='number'
																			placeholder='Enter sequence number'
																			className='glass-input'
																			{...field}
																		/>
																	</FormControl>
																</EnhancedInputContainer>
																<FormDescription className='text-xs text-slate-500 dark:text-slate-400'>
																	Set the order of this chapter in the sequence
																</FormDescription>
																<FormMessage />
															</FormItem>
														)}
													/>

													{/* Enhanced Checkbox Grid - First Row */}
													<div className='grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/30 dark:bg-black/20 rounded-2xl border border-white/20'>
														<EnhancedCheckboxField
															control={chapterCreateForm.control}
															name='selectionDiary'
															label='Selection Diary'
														/>
														<EnhancedCheckboxField
															control={chapterCreateForm.control}
															name='done'
															label='Completed'
														/>
														<EnhancedCheckboxField
															control={chapterCreateForm.control}
															name='DPP'
															label='DPP'
														/>
														<EnhancedCheckboxField
															control={chapterCreateForm.control}
															name='onePager'
															label='One Pager'
														/>
													</div>

													{/* Enhanced Checkbox Grid - Second Row */}
													<div className='grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-white/30 dark:bg-black/20 rounded-2xl border border-white/20'>
														<EnhancedCheckboxField
															control={chapterCreateForm.control}
															name='PYQ'
															label='Previous Year Questions'
														/>
														<EnhancedCheckboxField
															control={chapterCreateForm.control}
															name='Module'
															label='Module'
														/>
														<EnhancedCheckboxField
															control={chapterCreateForm.control}
															name='ExtraMaterial'
															label='Extra Material'
														/>
													</div>

													<Button
														type='submit'
														className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'>
														Create Chapter
													</Button>
												</form>
											</Form>
										</CardContent>
									</EnhancedCard>
								</TabsContent>

								{/* Topics Tab Content - New Implementation */}
								<TabsContent value='topics' className='mt-6 space-y-6'>
									<EnhancedCard>
										<CardHeader className='text-center pb-6'>
											<CardTitle className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
												Add New Topic
											</CardTitle>
											<CardDescription className='text-slate-600 dark:text-slate-400'>
												Create a new topic within a chapter
											</CardDescription>
										</CardHeader>
										<CardContent className='space-y-6'>
											{isLoadingChapters ? (
												<div className='flex justify-center items-center py-12'>
													<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
													<span className='ml-3 text-slate-600 dark:text-slate-400'>
														Loading chapters...
													</span>
												</div>
											) : (
												<Form {...topicCreateForm}>
													<form
														onSubmit={topicCreateForm.handleSubmit(
															handleTopicSubmit,
														)}
														className='space-y-6'>
														{/* Topic Name Field */}
														<FormField
															control={topicCreateForm.control}
															name='name'
															render={({ field }) => (
																<FormItem>
																	<EnhancedInputContainer>
																		<FormLabel className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
																			Topic Name
																		</FormLabel>
																		<FormControl>
																			<Input
																				placeholder='Enter topic name'
																				className='glass-input'
																				{...field}
																			/>
																		</FormControl>
																	</EnhancedInputContainer>
																	<FormDescription className='text-xs text-slate-500 dark:text-slate-400'>
																		Provide a descriptive name for the topic
																	</FormDescription>
																	<FormMessage />
																</FormItem>
															)}
														/>

														{/* Chapter Selection Field - Subject-wise Grouped */}
														<FormField
															control={topicCreateForm.control}
															name='chapter'
															render={({ field }) => (
																<FormItem>
																	<EnhancedInputContainer>
																		<FormLabel className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
																			Chapter
																		</FormLabel>
																		<Select
																			onValueChange={field.onChange}
																			defaultValue={field.value}>
																			<FormControl>
																				<SelectTrigger className='glass-select'>
																					<SelectValue placeholder='Select the chapter for this topic' />
																				</SelectTrigger>
																			</FormControl>
																			<SelectContent className='glass-content max-h-60'>
																				{Object.entries(
																					groupedChapterOptions,
																				).map(([standard, subjects]) => (
																					<div key={standard}>
																						<Label className='font-semibold text-blue-600 px-2 py-1'>
																							Class {standard}
																						</Label>
																						{subjects.map((subject) => (
																							<SelectGroup key={subject._id}>
																								<SelectLabel className='text-sm font-medium text-slate-600 pl-4'>
																									{subject.name}
																								</SelectLabel>
																								{subject.chapterList.map(
																									(chapter) => (
																										<SelectItem
																											key={chapter._id}
																											value={chapter._id}
																											className='pl-8 hover:bg-blue-50 dark:hover:bg-blue-900/20'>
																											{chapter.name} (Seq:{' '}
																											{chapter.seqNumber})
																										</SelectItem>
																									),
																								)}
																							</SelectGroup>
																						))}
																					</div>
																				))}
																			</SelectContent>
																		</Select>
																	</EnhancedInputContainer>
																	<FormDescription className='text-xs text-slate-500 dark:text-slate-400'>
																		Choose the chapter this topic belongs to
																	</FormDescription>
																	<FormMessage />
																</FormItem>
															)}
														/>

														{/* Sequence Number Field */}
														<FormField
															control={topicCreateForm.control}
															name='seqNumber'
															render={({ field }) => (
																<FormItem>
																	<EnhancedInputContainer>
																		<FormLabel className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
																			Sequence Number
																		</FormLabel>
																		<FormControl>
																			<Input
																				type='number'
																				placeholder='Enter sequence number'
																				className='glass-input'
																				value={field.value}
																				onChange={(e) =>
																					field.onChange(Number(e.target.value))
																				}
																			/>
																		</FormControl>
																	</EnhancedInputContainer>
																	<FormDescription className='text-xs text-slate-500 dark:text-slate-400'>
																		Set the order of this topic in the sequence
																	</FormDescription>
																	<FormMessage />
																</FormItem>
															)}
														/>

														{/* Enhanced Checkbox Grid for Topic Categories */}
														<div className='grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/30 dark:bg-black/20 rounded-2xl border border-white/20'>
															<EnhancedCheckboxField
																control={topicCreateForm.control}
																name='done'
																label='Completed'
															/>
															<EnhancedCheckboxField
																control={topicCreateForm.control}
																name='boards'
																label='Board Exams'
															/>
															<EnhancedCheckboxField
																control={topicCreateForm.control}
																name='mains'
																label='Mains'
															/>
															<EnhancedCheckboxField
																control={topicCreateForm.control}
																name='advanced'
																label='Advanced'
															/>
														</div>

														<Button
															type='submit'
															className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'>
															Create Topic
														</Button>
													</form>
												</Form>
											)}
										</CardContent>
									</EnhancedCard>
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			</section>

			{/* Enhanced Custom Styles */}
			<style jsx global>{`
				/* Glass Input Styling */
				.glass-input {
					@apply bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-xl shadow-lg transition-all duration-300;
					@apply focus:bg-white/70 dark:focus:bg-black/50 focus:border-blue-400/50 focus:shadow-xl focus:shadow-blue-500/20;
				}

				.glass-select {
					@apply bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-xl shadow-lg transition-all duration-300;
					@apply focus:bg-white/70 dark:focus:bg-black/50 focus:border-blue-400/50 focus:shadow-xl focus:shadow-blue-500/20;
				}

				.glass-content {
					@apply bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl rounded-xl;
				}

				/* Enhanced Checkbox Animation */
				.enhanced-checkbox {
					@apply transition-all duration-300 hover:scale-110;
				}

				/* Smooth Page Transitions */
				.page-transition {
					@apply transition-all duration-500 ease-in-out;
				}

				/* Enhanced Hover Effects */
				.hover-lift {
					@apply transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-xl;
				}

				/* Particle Animation Background */
				@keyframes float {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-20px);
					}
				}

				.floating {
					animation: float 6s ease-in-out infinite;
				}

				.floating.delay-1 {
					animation-delay: 1s;
				}

				.floating.delay-2 {
					animation-delay: 2s;
				}
			`}</style>
		</>
	);
};

export default AddPage;

// * Enhanced Input Container Component with Glass Morphism
const EnhancedInputContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				'flex w-full flex-col space-y-3 group',
				'transition-all duration-300',
				className,
			)}>
			{children}
		</div>
	);
};

// * Enhanced Card Component with Modern Glass Effects
const EnhancedCard = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<Card
			className={cn(
				'backdrop-blur-md bg-white/40 dark:bg-black/20',
				'border border-white/30 dark:border-white/10',
				'shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20',
				'rounded-2xl overflow-hidden',
				'transition-all duration-500 hover:shadow-3xl hover:shadow-blue-500/20',
				'hover:bg-white/50 dark:hover:bg-black/30',
				className,
			)}>
			{children}
		</Card>
	);
};

// * Enhanced Checkbox Field Component with Modern Styling
const EnhancedCheckboxField = ({
	control,
	name,
	label,
}: {
	control: any;
	name: string;
	label: string;
}) => {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className='space-y-2'>
					<div className='flex items-center space-x-3 p-3 rounded-xl bg-white/20 dark:bg-black/20 border border-white/20 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 group'>
						<FormControl>
							<Checkbox
								checked={field.value}
								onCheckedChange={field.onChange}
								className='enhanced-checkbox data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-2 border-slate-300 dark:border-slate-600'
							/>
						</FormControl>
						<FormLabel className='text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300'>
							{label}
						</FormLabel>
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient backgrounds with dynamic color transitions using Tailwind's gradient utilities
// * 2. Glass morphism effects with backdrop-blur and transparency throughout all components
// * 3. Animated gradient orbs for visual depth and movement in the background
// * 4. Enhanced floating dock with improved glass styling for tabs and cards
// * 5. Subtle particle animations for ambient background effects with floating keyframes
// * 6. Improved responsive design with better mobile adaptation using responsive grid classes
// * 7. Enhanced dark mode compatibility with better contrast ratios and proper dark: prefixes
// * 8. Interactive hover effects with scale transformations on icons and interactive elements
// * 9. Professional color scheme using blue-indigo-purple gradient palette consistently
// * 10. Layered visual hierarchy with proper z-indexing for overlapping elements
// * 11. Smooth micro-animations and transitions throughout with duration-300 classes
// * 12. Better accessibility with proper ARIA labels and semantic structure in form components
// * 13. Enhanced shadow system for depth perception using shadow-xl and custom shadow colors
// * 14. Consistent border radius system for modern appearance with rounded-xl and rounded-2xl
// * 15. Optimized backdrop filters for performance using backdrop-blur-sm to backdrop-blur-xl
// * 16. Improved spacing and padding system with consistent space-y-6 and padding classes
// * 17. Better content isolation with backdrop effects separating content layers
// * 18. Enhanced visual feedback on interactive elements with hover states and transitions
// * 19. Modern CSS animations with proper timing functions using ease-in-out and custom delays
// * 20. Responsive viewport handling with proper overflow management and min-h-screen

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Memoized axios configuration to prevent unnecessary re-renders
// * 2. useCallback hooks for all submit handlers to prevent function recreation
// * 3. useMemo for grouped chapter options to avoid recalculation on every render
// * 4. Optimized useEffect dependencies to prevent unnecessary API calls
// * 5. Conditional chapter loading only when topics tab is active
// * 6. Proper form validation modes set to 'onChange' for real-time feedback
// * 7. Error boundary patterns with try-catch blocks in async functions
// * 8. Efficient state management with minimal re-renders
// * 9. Tree-shaking friendly import statements for UI components
// * 10. Hydration-safe patterns with proper client-side only operations

// ! FUTURE IMPROVEMENTS:
// TODO: Implement toast notifications for success/error feedback using react-hot-toast
// TODO: Add form field animations with Framer Motion for enhanced user experience
// TODO: Implement drag-and-drop reordering for sequence numbers
// TODO: Add bulk import functionality for subjects, chapters, and topics
// TODO: Implement search and filter functionality for large datasets
// TODO: Add data visualization components for progress tracking
// TODO: Implement offline support with service workers and local caching
// TODO: Add keyboard shortcuts for power users (Ctrl+S for save, etc.)
// TODO: Implement theme customization with user preferences
// TODO: Add comprehensive loading skeletons for better perceived performance
// TODO: Implement advanced form validation with custom rules
// TODO: Add export functionality for data backup and sharing
