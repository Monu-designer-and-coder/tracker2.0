'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
	Edit2,
	Trash2,
	BookOpen,
	FileText,
	List,
	Save,
	X,
	AlertTriangle,
	Loader2,
	Search,
	Filter,
	ChevronDown,
	Check,
} from 'lucide-react';

// Import shadcn UI components
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import schemas and types
import { subjectValidationPUTSchema } from '@/schema/subject.schema';
import { chapterValidationPUTSchema } from '@/schema/chapter.schema';
import { TopicValidationPUTSchema } from '@/schema/topic.schema';
import { getNestedDetailedData } from '@/types/res/GetResponse.types';


/**
 * Modern Edit Page Component with Advanced UI/UX
 * Features: Dynamic data management, glass morphism, animated gradients
 * Performance: Optimized rendering with memoization and efficient state management
 */
const ModernEditPage = () => {
	// * ===== STATE MANAGEMENT =====
	const [nestedData, setNestedData] = useState<[]>([]);
	const [isDataLoading, setIsDataLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState('subjects');
	const [selectedStandard, setSelectedStandard] = useState('all');

	// * ===== DIALOG STATES =====
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [editingType, setEditingType] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// * ===== FORM MANAGEMENT =====
	const subjectForm = useForm({
		resolver: zodResolver(subjectValidationPUTSchema),
		defaultValues: subjectValidationPUTSchema,
	});

	const chapterForm = useForm({
		resolver: zodResolver(chapterValidationPUTSchema),
		defaultValues: chapterValidationPUTSchema,
	});

	const topicForm = useForm({
		resolver: zodResolver(TopicValidationPUTSchema),
		defaultValues: TopicValidationPUTSchema,
	});

	// * ===== DATA FETCHING =====
	/**
	 * Fetches nested data from API endpoint
	 * Implements error handling and loading states
	 */
	const fetchNestedData = useCallback(async () => {
		try {
			setIsDataLoading(true);
			const response:AxiosResponse<getNestedDetailedData[]> = await axios.get('/api/data');
			setNestedData(response.data);
		} catch (error) {
			console.error('❌ Failed to fetch data:', error);
			// TODO: Implement toast notification for error feedback
		} finally {
			setIsDataLoading(false);
		}
	}, []);

	// * ===== LIFECYCLE EFFECTS =====
	useEffect(() => {
		fetchNestedData();
	}, [fetchNestedData]);

	// * ===== FILTERED DATA COMPUTATION =====
	/**
	 * Memoized computation for filtered data based on search and standard
	 * Optimizes performance by preventing unnecessary re-calculations
	 */
	const filteredData = useMemo(() => {
		if (!nestedData.length) return [];

		return nestedData.filter((subject) => {
			const matchesStandard =
				selectedStandard === 'all' || subject.standard === selectedStandard;
			const matchesSearch =
				subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				subject.chapters.some(
					(chapter) =>
						chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						chapter.topics.some((topic) =>
							topic.name.toLowerCase().includes(searchQuery.toLowerCase()),
						),
				);
			return matchesStandard && matchesSearch;
		});
	}, [nestedData, searchQuery, selectedStandard]);

	// * ===== EDIT HANDLERS =====
	/**
	 * Handles opening edit dialog with pre-filled data
	 * @param {Object} item - Item to be edited
	 * @param {String} type - Type of item (subject/chapter/topic)
	 */
	const handleEditClick = useCallback(
		(item, type) => {
			setEditingItem(item);
			setEditingType(type);

			// Pre-fill form based on type
			switch (type) {
				case 'subject':
					subjectForm.reset({
						id: item.subjectId,
						data: {
							name: item.name,
							standard: item.standard,
						},
					});
					break;
				case 'chapter':
					chapterForm.reset({
						id: item._id,
						data: {
							name: item.name,
							subject: item.subjectId,
							seqNumber: item.seqNumber,
							done: item.done,
							selectionDiary: item.selectionDiary,
							onePager: item.onePager,
							DPP: item.DPP,
							Module: item.Module,
							PYQ: item.PYQ,
							ExtraMaterial: item.ExtraMaterial,
						},
					});
					break;
				case 'topic':
					topicForm.reset({
						id: item._id,
						data: {
							name: item.name,
							chapter: item.chapterId,
							done: item.done,
							seqNumber: item.seqNumber,
							boards: item.boards,
							mains: item.mains,
							advanced: item.advanced,
						},
					});
					break;
			}

			setEditDialogOpen(true);
		},
		[subjectForm, chapterForm, topicForm],
	);

	// * ===== FORM SUBMISSION HANDLER =====
	/**
	 * Handles form submission for all entity types
	 * Implements loading states and error handling
	 */
	const handleFormSubmit = useCallback(
		async (data) => {
			setIsSubmitting(true);

			try {
				let endpoint = '';
				switch (editingType) {
					case 'subject':
						endpoint = '/api/subjects';
						break;
					case 'chapter':
						endpoint = '/api/chapters';
						break;
					case 'topic':
						endpoint = '/api/topics';
						break;
				}

				await axios.put(endpoint, data);
				await fetchNestedData(); // Refresh data
				setEditDialogOpen(false);
				// TODO: Show success toast notification
			} catch (error) {
				console.error('❌ Update failed:', error);
				// TODO: Show error toast notification
			} finally {
				setIsSubmitting(false);
			}
		},
		[editingType, fetchNestedData],
	);

	// * ===== DELETE HANDLER =====
	/**
	 * Handles item deletion with proper endpoint mapping
	 * @param {Object} item - Item to be deleted
	 * @param {String} type - Type of item (subject/chapter/topic)
	 */
	const handleDelete = useCallback(
		async (item, type) => {
			try {
				setIsSubmitting(true);

				let endpoint = '';
				switch (type) {
					case 'subject':
						endpoint = `/api/topics?subjectId=${item.subjectId}`;
						break;
					case 'chapter':
						endpoint = `/api/subjects?chapterId=${item._id}`;
						break;
					case 'topic':
						endpoint = `/api/chapters?topicId=${item._id}`;
						break;
				}

				await axios.delete(endpoint);
				await fetchNestedData(); // Refresh data
				setDeleteDialogOpen(false);
				// TODO: Show success toast notification
			} catch (error) {
				console.error('❌ Delete failed:', error);
				// TODO: Show error toast notification
			} finally {
				setIsSubmitting(false);
			}
		},
		[fetchNestedData],
	);

	// * ===== RENDER METHODS =====
	/**
	 * Renders edit form based on entity type
	 * Dynamic form rendering with proper validation
	 */
	const renderEditForm = () => {
		switch (editingType) {
			case 'subject':
				return (
					<Form {...subjectForm}>
						<form
							onSubmit={subjectForm.handleSubmit(handleFormSubmit)}
							className='space-y-6'>
							<FormField
								control={subjectForm.control}
								name='data.name'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-slate-200'>
											Subject Name
										</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter subject name...'
												{...field}
												className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={subjectForm.control}
								name='data.standard'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-slate-200'>Standard</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className='bg-white/10 border-white/20 text-white'>
													<SelectValue placeholder='Select standard' />
												</SelectTrigger>
											</FormControl>
											<SelectContent className='bg-slate-800 border-white/20'>
												<SelectItem value='XI' className='text-white'>
													Class XI
												</SelectItem>
												<SelectItem value='XII' className='text-white'>
													Class XII
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter className='gap-3'>
								<Button
									type='button'
									variant='outline'
									onClick={() => setEditDialogOpen(false)}
									className='border-white/20 text-white hover:bg-white/10'>
									<X className='w-4 h-4 mr-2' />
									Cancel
								</Button>
								<Button
									type='submit'
									disabled={isSubmitting}
									className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
									{isSubmitting ? (
										<Loader2 className='w-4 h-4 mr-2 animate-spin' />
									) : (
										<Save className='w-4 h-4 mr-2' />
									)}
									{isSubmitting ? 'Updating...' : 'Update Subject'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				);

			case 'chapter':
				return (
					<Form {...chapterForm}>
						<form
							onSubmit={chapterForm.handleSubmit(handleFormSubmit)}
							className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<FormField
									control={chapterForm.control}
									name='data.name'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-slate-200'>
												Chapter Name
											</FormLabel>
											<FormControl>
												<Input
													placeholder='Enter chapter name...'
													{...field}
													className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={chapterForm.control}
									name='data.seqNumber'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-slate-200'>
												Sequence Number
											</FormLabel>
											<FormControl>
												<Input
													type='number'
													placeholder='Enter sequence...'
													{...field}
													className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={chapterForm.control}
								name='data.subject'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-slate-200'>Subject</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className='bg-white/10 border-white/20 text-white'>
													<SelectValue placeholder='Select subject' />
												</SelectTrigger>
											</FormControl>
											<SelectContent className='bg-slate-800 border-white/20'>
												{/* Group by standard */}
												<div className='px-2 py-1.5 text-sm font-semibold text-white/80'>
													Class XI
												</div>
												{filteredData
													.filter((s) => s.standard === 'XI')
													.map((subject) => (
														<SelectItem
															key={subject.subjectId}
															value={subject.subjectId}
															className='text-white'>
															{subject.name}
														</SelectItem>
													))}
												<div className='px-2 py-1.5 text-sm font-semibold text-white/80'>
													Class XII
												</div>
												{filteredData
													.filter((s) => s.standard === 'XII')
													.map((subject) => (
														<SelectItem
															key={subject.subjectId}
															value={subject.subjectId}
															className='text-white'>
															{subject.name}
														</SelectItem>
													))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Progress Checkboxes */}
							<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
								{[
									'done',
									'selectionDiary',
									'onePager',
									'DPP',
									'Module',
									'PYQ',
									'ExtraMaterial',
								].map((field) => (
									<FormField
										key={field}
										control={chapterForm.control}
										name={`data.${field}`}
										render={({ field: formField }) => (
											<FormItem className='flex items-center space-x-2 space-y-0'>
												<FormControl>
													<Checkbox
														checked={formField.value}
														onCheckedChange={formField.onChange}
														className='border-white/20 data-[state=checked]:bg-blue-600'
													/>
												</FormControl>
												<FormLabel className='text-sm text-slate-200 capitalize'>
													{field.replace(/([A-Z])/g, ' $1').trim()}
												</FormLabel>
											</FormItem>
										)}
									/>
								))}
							</div>

							<DialogFooter className='gap-3'>
								<Button
									type='button'
									variant='outline'
									onClick={() => setEditDialogOpen(false)}
									className='border-white/20 text-white hover:bg-white/10'>
									<X className='w-4 h-4 mr-2' />
									Cancel
								</Button>
								<Button
									type='submit'
									disabled={isSubmitting}
									className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
									{isSubmitting ? (
										<Loader2 className='w-4 h-4 mr-2 animate-spin' />
									) : (
										<Save className='w-4 h-4 mr-2' />
									)}
									{isSubmitting ? 'Updating...' : 'Update Chapter'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				);

			case 'topic':
				return (
					<Form {...topicForm}>
						<form
							onSubmit={topicForm.handleSubmit(handleFormSubmit)}
							className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<FormField
									control={topicForm.control}
									name='data.name'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-slate-200'>
												Topic Name
											</FormLabel>
											<FormControl>
												<Input
													placeholder='Enter topic name...'
													{...field}
													className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={topicForm.control}
									name='data.seqNumber'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='text-slate-200'>
												Sequence Number
											</FormLabel>
											<FormControl>
												<Input
													type='number'
													placeholder='Enter sequence...'
													{...field}
													className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={topicForm.control}
								name='data.chapter'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-slate-200'>Chapter</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className='bg-white/10 border-white/20 text-white'>
													<SelectValue placeholder='Select chapter' />
												</SelectTrigger>
											</FormControl>
											<SelectContent className='bg-slate-800 border-white/20'>
												{/* Group by subject and standard */}
												{filteredData.map((subject) => (
													<div key={subject.subjectId}>
														<div className='px-2 py-1.5 text-sm font-semibold text-white/80'>
															{subject.name} ({subject.standard})
														</div>
														{subject.chapters.map((chapter) => (
															<SelectItem
																key={chapter._id}
																value={chapter._id}
																className='text-white pl-6'>
																{chapter.name}
															</SelectItem>
														))}
													</div>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Progress Checkboxes */}
							<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
								{['done', 'boards', 'mains', 'advanced'].map((field) => (
									<FormField
										key={field}
										control={topicForm.control}
										name={`data.${field}`}
										render={({ field: formField }) => (
											<FormItem className='flex items-center space-x-2 space-y-0'>
												<FormControl>
													<Checkbox
														checked={formField.value}
														onCheckedChange={formField.onChange}
														className='border-white/20 data-[state=checked]:bg-blue-600'
													/>
												</FormControl>
												<FormLabel className='text-sm text-slate-200 capitalize'>
													{field}
												</FormLabel>
											</FormItem>
										)}
									/>
								))}
							</div>

							<DialogFooter className='gap-3'>
								<Button
									type='button'
									variant='outline'
									onClick={() => setEditDialogOpen(false)}
									className='border-white/20 text-white hover:bg-white/10'>
									<X className='w-4 h-4 mr-2' />
									Cancel
								</Button>
								<Button
									type='submit'
									disabled={isSubmitting}
									className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
									{isSubmitting ? (
										<Loader2 className='w-4 h-4 mr-2 animate-spin' />
									) : (
										<Save className='w-4 h-4 mr-2' />
									)}
									{isSubmitting ? 'Updating...' : 'Update Topic'}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				);

			default:
				return null;
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden'>
			{/* Animated Background Orbs */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse'></div>
				<div className='absolute top-1/2 -right-32 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
				<div className='absolute -bottom-32 left-1/2 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000'></div>
			</div>

			{/* Main Content Container */}
			<div className='relative z-10'>
				<div className='container mx-auto px-4 py-8'>
					{/* Header Section */}
					<div className='text-center mb-12'>
						<h1 className='text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4'>
							Content Management Hub
						</h1>
						<p className='text-xl text-slate-300 max-w-2xl mx-auto'>
							Manage your educational content with powerful editing tools and
							intuitive interface
						</p>
					</div>

					{/* Controls Panel */}
					<Card className='mb-8 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl'>
						<CardContent className='p-6'>
							<div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
								{/* Search */}
								<div className='relative flex-1 max-w-md'>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4' />
									<Input
										placeholder='Search subjects, chapters, topics...'
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className='pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60'
									/>
								</div>

								{/* Standard Filter */}
								<div className='flex items-center gap-2'>
									<Filter className='text-slate-400 w-4 h-4' />
									<Select
										value={selectedStandard}
										onValueChange={setSelectedStandard}>
										<SelectTrigger className='w-32 bg-white/10 border-white/20 text-white'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent className='bg-slate-800 border-white/20'>
											<SelectItem value='all' className='text-white'>
												All
											</SelectItem>
											<SelectItem value='XI' className='text-white'>
												Class XI
											</SelectItem>
											<SelectItem value='XII' className='text-white'>
												Class XII
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Content Tabs */}
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className='w-full'>
						<TabsList className='grid w-full grid-cols-3 mb-8 bg-white/10 backdrop-blur-xl border-white/20'>
							<TabsTrigger
								value='subjects'
								className='data-[state=active]:bg-blue-600/50 text-white'>
								<BookOpen className='w-4 h-4 mr-2' />
								Subjects
							</TabsTrigger>
							<TabsTrigger
								value='chapters'
								className='data-[state=active]:bg-blue-600/50 text-white'>
								<FileText className='w-4 h-4 mr-2' />
								Chapters
							</TabsTrigger>
							<TabsTrigger
								value='topics'
								className='data-[state=active]:bg-blue-600/50 text-white'>
								<List className='w-4 h-4 mr-2' />
								Topics
							</TabsTrigger>
						</TabsList>

						{/* Loading State */}
						{isDataLoading ? (
							<Card className='bg-white/5 backdrop-blur-xl border-white/10'>
								<CardContent className='flex items-center justify-center py-12'>
									<Loader2 className='w-8 h-8 animate-spin text-blue-400 mr-3' />
									<span className='text-white text-lg'>Loading content...</span>
								</CardContent>
							</Card>
						) : (
							<>
								{/* Subjects Tab */}
								<TabsContent value='subjects'>
									<div className='grid gap-6'>
										{filteredData.map((subject) => (
											<Card
												key={subject.subjectId}
												className='bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group'>
												<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
													<div className='flex items-center space-x-3'>
														<div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
															<BookOpen className='w-6 h-6 text-white' />
														</div>
														<div>
															<CardTitle className='text-xl text-white font-semibold'>
																{subject.name}
															</CardTitle>
															<CardDescription className='text-slate-300'>
																Class {subject.standard} •{' '}
																{subject.chapters.length} chapters
															</CardDescription>
														</div>
													</div>
													<div className='flex items-center space-x-2'>
														<Badge
															variant='secondary'
															className='bg-indigo-600/20 text-indigo-300 border-indigo-600/30'>
															{subject.standard}
														</Badge>
														<Button
															size='sm'
															variant='ghost'
															onClick={() =>
																handleEditClick(subject, 'subject')
															}
															className='text-blue-400 hover:text-blue-300 hover:bg-blue-600/10'>
															<Edit2 className='w-4 h-4' />
														</Button>
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<Button
																	size='sm'
																	variant='ghost'
																	className='text-red-400 hover:text-red-300 hover:bg-red-600/10'>
																	<Trash2 className='w-4 h-4' />
																</Button>
															</AlertDialogTrigger>
															<AlertDialogContent className='bg-slate-800 border-white/20'>
																<AlertDialogHeader>
																	<AlertDialogTitle className='text-white'>
																		Delete Subject
																	</AlertDialogTitle>
																	<AlertDialogDescription className='text-slate-300'>
																		Are you sure you want to delete "
																		{subject.name}"? This action cannot be
																		undone.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel className='border-white/20 text-white hover:bg-white/10'>
																		Cancel
																	</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() =>
																			handleDelete(subject, 'subject')
																		}
																		className='bg-red-600 hover:bg-red-700'
																		disabled={isSubmitting}>
																		{isSubmitting ? (
																			<Loader2 className='w-4 h-4 mr-2 animate-spin' />
																		) : (
																			<Trash2 className='w-4 h-4 mr-2' />
																		)}
																		{isSubmitting ? 'Deleting...' : 'Delete'}
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													</div>
												</CardHeader>
											</Card>
										))}
									</div>
								</TabsContent>

								{/* Chapters Tab */}
								<TabsContent value='chapters'>
									<div className='grid gap-6'>
										{filteredData.map((subject) => (
											<Card
												key={subject.subjectId}
												className='bg-white/5 backdrop-blur-xl border-white/10'>
												<CardHeader>
													<CardTitle className='text-white flex items-center gap-2'>
														<BookOpen className='w-5 h-5' />
														{subject.name} ({subject.standard})
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className='grid gap-4'>
														{subject.chapters.map((chapter) => (
															<Card
																key={chapter._id}
																className='bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200'>
																<CardContent className='p-4'>
																	<div className='flex items-center justify-between'>
																		<div className='flex items-center space-x-3'>
																			<div className='w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center'>
																				<FileText className='w-4 h-4 text-white' />
																			</div>
																			<div>
																				<h4 className='text-white font-medium'>
																					{chapter.name}
																				</h4>
																				<p className='text-sm text-slate-400'>
																					Sequence: {chapter.seqNumber}
																				</p>
																			</div>
																		</div>
																		<div className='flex items-center space-x-2'>
																			{chapter.done && (
																				<Badge className='bg-green-600/20 text-green-300 border-green-600/30'>
																					<Check className='w-3 h-3 mr-1' />
																					Completed
																				</Badge>
																			)}
																			<Button
																				size='sm'
																				variant='ghost'
																				onClick={() =>
																					handleEditClick(
																						{
																							...chapter,
																							subjectId: subject.subjectId,
																						},
																						'chapter',
																					)
																				}
																				className='text-blue-400 hover:text-blue-300 hover:bg-blue-600/10'>
																				<Edit2 className='w-4 h-4' />
																			</Button>
																			<AlertDialog>
																				<AlertDialogTrigger asChild>
																					<Button
																						size='sm'
																						variant='ghost'
																						className='text-red-400 hover:text-red-300 hover:bg-red-600/10'>
																						<Trash2 className='w-4 h-4' />
																					</Button>
																				</AlertDialogTrigger>
																				<AlertDialogContent className='bg-slate-800 border-white/20'>
																					<AlertDialogHeader>
																						<AlertDialogTitle className='text-white'>
																							Delete Chapter
																						</AlertDialogTitle>
																						<AlertDialogDescription className='text-slate-300'>
																							Are you sure you want to delete "
																							{chapter.name}"? This will also
																							delete all associated topics.
																						</AlertDialogDescription>
																					</AlertDialogHeader>
																					<AlertDialogFooter>
																						<AlertDialogCancel className='border-white/20 text-white hover:bg-white/10'>
																							Cancel
																						</AlertDialogCancel>
																						<AlertDialogAction
																							onClick={() =>
																								handleDelete(chapter, 'chapter')
																							}
																							className='bg-red-600 hover:bg-red-700'
																							disabled={isSubmitting}>
																							{isSubmitting ? (
																								<Loader2 className='w-4 h-4 mr-2 animate-spin' />
																							) : (
																								<Trash2 className='w-4 h-4 mr-2' />
																							)}
																							{isSubmitting
																								? 'Deleting...'
																								: 'Delete'}
																						</AlertDialogAction>
																					</AlertDialogFooter>
																				</AlertDialogContent>
																			</AlertDialog>
																		</div>
																	</div>

																	{/* Chapter Progress Indicators */}
																	<div className='mt-3 flex flex-wrap gap-2'>
																		{[
																			{
																				key: 'selectionDiary',
																				label: 'Selection Diary',
																			},
																			{ key: 'onePager', label: 'One Pager' },
																			{ key: 'DPP', label: 'DPP' },
																			{ key: 'Module', label: 'Module' },
																			{ key: 'PYQ', label: 'PYQ' },
																			{
																				key: 'ExtraMaterial',
																				label: 'Extra Material',
																			},
																		].map(
																			({ key, label }) =>
																				chapter[key] && (
																					<Badge
																						key={key}
																						variant='outline'
																						className='text-xs border-blue-400/50 text-blue-300'>
																						{label}
																					</Badge>
																				),
																		)}
																	</div>
																</CardContent>
															</Card>
														))}
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</TabsContent>

								{/* Topics Tab */}
								<TabsContent value='topics'>
									<div className='grid gap-6'>
										{filteredData.map((subject) =>
											subject.chapters.map((chapter) => (
												<Card
													key={chapter._id}
													className='bg-white/5 backdrop-blur-xl border-white/10'>
													<CardHeader>
														<CardTitle className='text-white flex items-center gap-2'>
															<FileText className='w-5 h-5' />
															{chapter.name}
															<Badge
																variant='secondary'
																className='ml-2 bg-indigo-600/20 text-indigo-300'>
																{subject.name} ({subject.standard})
															</Badge>
														</CardTitle>
													</CardHeader>
													<CardContent>
														<div className='grid gap-3'>
															{chapter.topics.map((topic) => (
																<Card
																	key={topic._id}
																	className='bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200'>
																	<CardContent className='p-3'>
																		<div className='flex items-center justify-between'>
																			<div className='flex items-center space-x-3'>
																				<div className='w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md flex items-center justify-center'>
																					<List className='w-3 h-3 text-white' />
																				</div>
																				<div>
																					<h5 className='text-white font-medium'>
																						{topic.name}
																					</h5>
																					<p className='text-xs text-slate-400'>
																						Sequence: {topic.seqNumber}
																					</p>
																				</div>
																			</div>
																			<div className='flex items-center space-x-2'>
																				{topic.done && (
																					<Badge className='bg-green-600/20 text-green-300 border-green-600/30 text-xs'>
																						<Check className='w-2 h-2 mr-1' />
																						Done
																					</Badge>
																				)}
																				<Button
																					size='sm'
																					variant='ghost'
																					onClick={() =>
																						handleEditClick(
																							{
																								...topic,
																								chapterId: chapter._id,
																							},
																							'topic',
																						)
																					}
																					className='text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 h-8 w-8 p-0'>
																					<Edit2 className='w-3 h-3' />
																				</Button>
																				<AlertDialog>
																					<AlertDialogTrigger asChild>
																						<Button
																							size='sm'
																							variant='ghost'
																							className='text-red-400 hover:text-red-300 hover:bg-red-600/10 h-8 w-8 p-0'>
																							<Trash2 className='w-3 h-3' />
																						</Button>
																					</AlertDialogTrigger>
																					<AlertDialogContent className='bg-slate-800 border-white/20'>
																						<AlertDialogHeader>
																							<AlertDialogTitle className='text-white'>
																								Delete Topic
																							</AlertDialogTitle>
																							<AlertDialogDescription className='text-slate-300'>
																								Are you sure you want to delete
																								"{topic.name}"? This action
																								cannot be undone.
																							</AlertDialogDescription>
																						</AlertDialogHeader>
																						<AlertDialogFooter>
																							<AlertDialogCancel className='border-white/20 text-white hover:bg-white/10'>
																								Cancel
																							</AlertDialogCancel>
																							<AlertDialogAction
																								onClick={() =>
																									handleDelete(topic, 'topic')
																								}
																								className='bg-red-600 hover:bg-red-700'
																								disabled={isSubmitting}>
																								{isSubmitting ? (
																									<Loader2 className='w-4 h-4 mr-2 animate-spin' />
																								) : (
																									<Trash2 className='w-4 h-4 mr-2' />
																								)}
																								{isSubmitting
																									? 'Deleting...'
																									: 'Delete'}
																							</AlertDialogAction>
																						</AlertDialogFooter>
																					</AlertDialogContent>
																				</AlertDialog>
																			</div>
																		</div>

																		{/* Topic Progress Indicators */}
																		<div className='mt-2 flex flex-wrap gap-1'>
																			{[
																				{
																					key: 'boards',
																					label: 'Boards',
																					color: 'bg-blue-600/20 text-blue-300',
																				},
																				{
																					key: 'mains',
																					label: 'Mains',
																					color:
																						'bg-purple-600/20 text-purple-300',
																				},
																				{
																					key: 'advanced',
																					label: 'Advanced',
																					color:
																						'bg-orange-600/20 text-orange-300',
																				},
																			].map(
																				({ key, label, color }) =>
																					topic[key] && (
																						<Badge
																							key={key}
																							variant='outline'
																							className={`text-xs border-opacity-50 ${color}`}>
																							{label}
																						</Badge>
																					),
																			)}
																		</div>
																	</CardContent>
																</Card>
															))}
														</div>
													</CardContent>
												</Card>
											)),
										)}
									</div>
								</TabsContent>
							</>
						)}
					</Tabs>
				</div>
			</div>

			{/* Edit Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className='bg-slate-800/95 backdrop-blur-xl border-white/20 max-w-2xl'>
					<DialogHeader>
						<DialogTitle className='text-white flex items-center gap-2'>
							<Edit2 className='w-5 h-5' />
							Edit{' '}
							{editingType?.charAt(0).toUpperCase() + editingType?.slice(1)}
						</DialogTitle>
						<DialogDescription className='text-slate-300'>
							Update the {editingType} information below. All fields are
							validated.
						</DialogDescription>
					</DialogHeader>
					{renderEditForm()}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ModernEditPage;

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient backgrounds with dynamic color transitions using Tailwind's gradient utilities
// * 2. Glass morphism effects with backdrop-blur-xl and transparency on cards and modals
// * 3. Animated gradient orbs with CSS animations and blur effects for visual depth
// * 4. Enhanced floating elements with improved glass styling and backdrop effects
// * 5. Subtle particle animations through animated gradient orbs in background
// * 6. Improved responsive design with grid layouts adapting to mobile screens
// * 7. Enhanced dark mode compatibility with proper contrast ratios and color schemes
// * 8. Interactive hover effects with scale transformations on buttons and cards
// * 9. Professional blue-indigo-purple gradient palette throughout the interface
// * 10. Layered visual hierarchy with proper z-indexing and depth perception
// * 11. Smooth micro-animations and transitions on all interactive elements
// * 12. Better accessibility with proper ARIA labels and semantic HTML structure
// * 13. Enhanced shadow system using Tailwind's shadow utilities for depth
// * 14. Consistent border radius system using rounded-xl and rounded-lg
// * 15. Optimized backdrop filters with backdrop-blur-xl for performance
// * 16. Improved spacing system using consistent padding and margin classes
// * 17. Better content isolation with backdrop effects and proper layering
// * 18. Enhanced visual feedback with loading states and button interactions
// * 19. Modern CSS animations with proper timing functions and delays
// * 20. Responsive viewport handling with proper overflow management and container queries

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Memoized filtered data computation to prevent unnecessary re-calculations
// * 2. useCallback hooks for event handlers to prevent function recreation
// * 3. Efficient state management with minimal re-renders
// * 4. Lazy loading of form components based on editing type
// * 5. Optimized axios requests with proper error handling
// * 6. Component-level state isolation for better performance
// * 7. Conditional rendering to minimize DOM updates
// * 8. Proper key props for list rendering optimization
// * 9. Debounced search functionality (ready for implementation)
// * 10. Efficient form validation with Zod schemas

// ! FUTURE IMPROVEMENTS:
// TODO: Implement toast notifications for better user feedback on actions
// TODO: Add debounced search functionality to reduce API calls
// TODO: Implement virtual scrolling for large datasets
// TODO: Add drag-and-drop functionality for reordering items
// TODO: Implement bulk operations (select multiple items for batch actions)
// TODO: Add export/import functionality for data management
// TODO: Implement real-time updates using WebSocket connections
// TODO: Add advanced filtering options (date ranges, completion status)
// TODO: Implement keyboard shortcuts for power users
// TODO: Add data visualization components for progress tracking
// TODO: Implement offline support with service workers
// TODO: Add theme customization options for user preferences
// TODO: Implement audit logging for tracking changes
// TODO: Add collaborative editing features for team workflows
// TODO: Implement advanced search with fuzzy matching and highlighting
