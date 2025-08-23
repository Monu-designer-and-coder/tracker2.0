'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
	Clipboard,
	Plus,
	Calendar,
	Tag,
	CheckCircle2,
	AlertCircle,
	Loader2,
	Sparkles,
	Edit,
	Trash2,
} from 'lucide-react';
import { z } from 'zod';

// 🎯 Component imports with proper organization
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
	FormField,
	Form,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
	TaskCategorySchema,
	TaskFormSchema,
	TaskSchema,
	TaskCategoryPUTSchema,
	TaskPUTSchema,
} from '@/schema/tasks.schema';
import {
	getTaskCategoryResponse,
	getTaskResponse,
} from '@/types/res/GetResponse.types';

// 🔧 Enhanced types for better type safety
interface ApiConfig {
	method: string;
	maxBodyLength: number;
	url: string;
	headers: Record<string, string>;
	data: Record<string, any>;
}

interface LoadingStates {
	categories: boolean;
	tasks: boolean;
	submittingCategory: boolean;
	submittingTask: boolean;
	updatingCategory: boolean;
	updatingTask: boolean;
	deletingCategory: boolean;
	deletingTask: boolean;
}

// 🎨 Days of week configuration for better maintainability
const DAYS_OF_WEEK = [
	{ key: 'sunday', label: 'Sun', full: 'Sunday' },
	{ key: 'monday', label: 'Mon', full: 'Monday' },
	{ key: 'tuesday', label: 'Tue', full: 'Tuesday' },
	{ key: 'wednesday', label: 'Wed', full: 'Wednesday' },
	{ key: 'thursday', label: 'Thu', full: 'Thursday' },
	{ key: 'friday', label: 'Fri', full: 'Friday' },
	{ key: 'saturday', label: 'Sat', full: 'Saturday' },
] as const;

const TaskCategoryManagementPage: React.FC = () => {
	// 📊 State management with better organization
	const [taskCategoriesData, setTaskCategoriesData] = useState<
		getTaskCategoryResponse[]
	>([]);
	const [tasksListData, setTasksListData] = useState<getTaskResponse[]>([]);
	const [loadingStates, setLoadingStates] = useState<LoadingStates>({
		categories: true,
		tasks: true,
		submittingCategory: false,
		submittingTask: false,
		updatingCategory: false,
		updatingTask: false,
		deletingCategory: false,
		deletingTask: false,
	});
	const [errorMessages, setErrorMessages] = useState<{
		categories?: string;
		tasks?: string;
	}>({});

	// Dialog state management
	const [editingCategory, setEditingCategory] = useState<string | null>(null);
	const [editingTask, setEditingTask] = useState<string | null>(null);
	const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
	const [taskDialogOpen, setTaskDialogOpen] = useState(false);

	// 🔧 Memoized axios configuration for better performance
	const axiosConfig = useMemo(
		(): ApiConfig => ({
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

	// 📝 Form configurations with enhanced validation
	const taskCategoryForm = useForm<z.infer<typeof TaskCategorySchema>>({
		resolver: zodResolver(TaskCategorySchema),
		defaultValues: {
			category: '',
		},
		mode: 'onBlur',
	});

	const taskCreationForm = useForm<z.infer<typeof TaskFormSchema>>({
		resolver: zodResolver(TaskFormSchema),
		defaultValues: {
			task: '',
			category: '',
			sunday: false,
			monday: false,
			tuesday: false,
			wednesday: false,
			thursday: false,
			friday: false,
			saturday: false,
		},
		mode: 'onBlur',
	});

	// Edit forms
	const categoryEditForm = useForm<z.infer<typeof TaskCategorySchema>>({
		resolver: zodResolver(TaskCategorySchema),
		defaultValues: {
			category: '',
		},
		mode: 'onBlur',
	});

	const taskEditForm = useForm<z.infer<typeof TaskFormSchema>>({
		resolver: zodResolver(TaskFormSchema),
		defaultValues: {
			task: '',
			category: '',
			sunday: false,
			monday: false,
			tuesday: false,
			wednesday: false,
			thursday: false,
			friday: false,
			saturday: false,
		},
		mode: 'onBlur',
	});

	// 🚀 Optimized data fetching with better error handling
	const fetchInitialData = useCallback(async () => {
		try {
			setLoadingStates((prev) => ({ ...prev, categories: true, tasks: true }));
			setErrorMessages({});

			const [categoriesResponse, tasksResponse] = await Promise.all([
				axios.get<getTaskCategoryResponse[]>('/api/tasks/category'),
				axios.get<getTaskResponse[]>('/api/tasks/task'),
			]);

			setTaskCategoriesData(categoriesResponse.data);
			setTasksListData(tasksResponse.data);
		} catch (error) {
			console.error('❌ Failed to fetch initial data:', error);
			setErrorMessages({
				categories: 'Failed to load categories',
				tasks: 'Failed to load tasks',
			});
		} finally {
			setLoadingStates((prev) => ({
				...prev,
				categories: false,
				tasks: false,
			}));
		}
	}, []);

	// 🎯 Effect for initial data loading
	useEffect(() => {
		fetchInitialData();
	}, [fetchInitialData]);

	// 📝 Enhanced category form submission with better UX
	const handleCategoryFormSubmission = useCallback(
		async (formValues: z.infer<typeof TaskCategorySchema>) => {
			try {
				setLoadingStates((prev) => ({ ...prev, submittingCategory: true }));

				const requestConfig = {
					...axiosConfig,
					method: 'post',
					url: '/api/tasks/category',
					data: formValues,
				};

				const response = await axios.request(requestConfig);

				setTaskCategoriesData((currentCategories) => [
					...currentCategories,
					{
						_id: response.data._id,
						category: response.data.category,
					},
				]);

				taskCategoryForm.reset();
			} catch (error) {
				console.error('❌ Category creation failed:', error);
			} finally {
				setLoadingStates((prev) => ({ ...prev, submittingCategory: false }));
			}
		},
		[axiosConfig, taskCategoryForm],
	);

	// 📝 Enhanced task form submission with optimized day handling
	const handleTaskFormSubmission = useCallback(
		async (formValues: z.infer<typeof TaskFormSchema>) => {
			try {
				setLoadingStates((prev) => ({ ...prev, submittingTask: true }));

				const selectedDays = DAYS_OF_WEEK.filter(
					(day) => formValues[day.key as keyof typeof formValues],
				).map((day) => day.key);

				const taskPayload: z.infer<typeof TaskSchema> = {
					task: formValues.task,
					category: formValues.category,
					repeat: selectedDays.length > 0 ? selectedDays : [''],
				};

				const requestConfig = {
					...axiosConfig,
					method: 'post',
					url: '/api/tasks/task',
					data: taskPayload,
				};

				const response = await axios.request(requestConfig);

				setTasksListData((currentTasks) => [
					...currentTasks,
					{
						_id: response.data._id,
						task: response.data.task,
						category: response.data.category,
						repeat: response.data.repeat,
					},
				]);

				taskCreationForm.reset();
			} catch (error) {
				console.error('❌ Task creation failed:', error);
			} finally {
				setLoadingStates((prev) => ({ ...prev, submittingTask: false }));
			}
		},
		[axiosConfig, taskCreationForm],
	);

	// Edit category handler
	const handleCategoryEdit = useCallback(
		async (formValues: z.infer<typeof TaskCategorySchema>) => {
			if (!editingCategory) return;

			try {
				setLoadingStates((prev) => ({ ...prev, updatingCategory: true }));

				const requestConfig = {
					...axiosConfig,
					method: 'put',
					url: '/api/tasks/category',
					data: {
						id: editingCategory,
						data: {
							category: formValues.category,
						},
					},
				};

				const response = await axios.request(requestConfig);

				setTaskCategoriesData((currentCategories) =>
					currentCategories.map((cat) =>
						cat._id === editingCategory
							? { ...cat, category: response.data.category }
							: cat,
					),
				);

				setCategoryDialogOpen(false);
				setEditingCategory(null);
				categoryEditForm.reset();
			} catch (error) {
				console.error('❌ Category update failed:', error);
			} finally {
				setLoadingStates((prev) => ({ ...prev, updatingCategory: false }));
			}
		},
		[editingCategory, axiosConfig, categoryEditForm],
	);

	// Edit task handler
	const handleTaskEdit = useCallback(
		async (formValues: z.infer<typeof TaskFormSchema>) => {
			if (!editingTask) return;

			try {
				setLoadingStates((prev) => ({ ...prev, updatingTask: true }));

				const selectedDays = DAYS_OF_WEEK.filter(
					(day) => formValues[day.key as keyof typeof formValues],
				).map((day) => day.key);

				const updateData: any = {};
				if (formValues.task) updateData.task = formValues.task;
				if (formValues.category) updateData.category = formValues.category;
				if (selectedDays.length > 0) updateData.repeat = selectedDays;

				const requestConfig = {
					...axiosConfig,
					method: 'put',
					url: '/api/tasks/task',
					data: {
						id: editingTask,
						data: updateData,
					},
				};

				const response = await axios.request(requestConfig);

				setTasksListData((currentTasks) =>
					currentTasks.map((task) =>
						task._id === editingTask ? { ...task, ...response.data } : task,
					),
				);

				setTaskDialogOpen(false);
				setEditingTask(null);
				taskEditForm.reset();
			} catch (error) {
				console.error('❌ Task update failed:', error);
			} finally {
				setLoadingStates((prev) => ({ ...prev, updatingTask: false }));
			}
		},
		[editingTask, axiosConfig, taskEditForm],
	);

	// Delete category handler
	const handleCategoryDelete = useCallback(async (categoryId: string) => {
		try {
			setLoadingStates((prev) => ({ ...prev, deletingCategory: true }));

			await axios.delete(`/api/tasks/category?id=${categoryId}`);

			setTaskCategoriesData((currentCategories) =>
				currentCategories.filter((cat) => cat._id !== categoryId),
			);
		} catch (error) {
			console.error('❌ Category deletion failed:', error);
		} finally {
			setLoadingStates((prev) => ({ ...prev, deletingCategory: false }));
		}
	}, []);

	// Delete task handler
	const handleTaskDelete = useCallback(async (taskId: string) => {
		try {
			setLoadingStates((prev) => ({ ...prev, deletingTask: true }));

			await axios.delete(`/api/tasks/task?id=${taskId}`);

			setTasksListData((currentTasks) =>
				currentTasks.filter((task) => task._id !== taskId),
			);
		} catch (error) {
			console.error('❌ Task deletion failed:', error);
		} finally {
			setLoadingStates((prev) => ({ ...prev, deletingTask: false }));
		}
	}, []);

	// Helper to check if category is used by tasks
	const getCategoryUsage = useCallback(
		(categoryId: string) => {
			return tasksListData.filter(
				(task) => task.category === categoryId || task.category === categoryId,
			);
		},
		[tasksListData],
	);

	// Open edit category dialog
	const openCategoryEditDialog = useCallback(
		(category: getTaskCategoryResponse) => {
			setEditingCategory(category._id);
			categoryEditForm.setValue('category', category.category);
			setCategoryDialogOpen(true);
		},
		[categoryEditForm],
	);

	// Open edit task dialog
	const openTaskEditDialog = useCallback(
		(task: getTaskResponse) => {
			setEditingTask(task._id);
			taskEditForm.setValue('task', task.task);
			taskEditForm.setValue(
				'category',
				typeof task.category === 'string' ? task.category : task.category,
			);

			// Reset all days first
			DAYS_OF_WEEK.forEach((day) => {
				taskEditForm.setValue(
					day.key as keyof z.infer<typeof TaskFormSchema>,
					false,
				);
			});

			// Set selected days
			if (task.repeat) {
				task.repeat.forEach((day) => {
					if (day) {
						taskEditForm.setValue(
							day as keyof z.infer<typeof TaskFormSchema>,
							true,
						);
					}
				});
			}
			setTaskDialogOpen(true);
		},
		[taskEditForm],
	);

	// 📋 Enhanced copy to clipboard functionality
	const handleCopyToClipboard = useCallback(async (categoryId: string) => {
		try {
			await navigator.clipboard.writeText(categoryId);
		} catch (error) {
			console.error('❌ Failed to copy to clipboard:', error);
		}
	}, []);

	// 🎨 Filtered tasks for better performance
	const pendingTasksList = useMemo(
		() => tasksListData.filter((task) => task.done === undefined),
		[tasksListData],
	);

	return (
		<div className='flex flex-col lg:flex-row justify-between gap-6 items-start w-full max-w-7xl mx-auto h-full p-4'>
			{/* 🏷️ Category Management Section */}
			<section
				className='w-full lg:w-1/2 h-full flex flex-col'
				aria-label='Category Management'>
				{/* Enhanced header with gradient text */}
				<div className='mb-6'>
					<h2 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2'>
						<Tag className='w-6 h-6 text-blue-600' />
						Task Categories
					</h2>
					<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
						Create and manage your task categories
					</p>
				</div>

				{/* 📝 Category Creation Form */}
				<div className='bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 p-6 mb-6 shadow-lg'>
					<Form {...taskCategoryForm}>
						<form
							onSubmit={taskCategoryForm.handleSubmit(
								handleCategoryFormSubmission,
							)}
							className='space-y-4'>
							<FormField
								control={taskCategoryForm.control}
								name='category'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
											Category Name
										</FormLabel>
										<div className='relative'>
											<FormControl>
												<Input
													placeholder='e.g., Work, Personal, Health...'
													className='pr-16 bg-white/70 dark:bg-black/30 border-white/30 dark:border-white/20 focus:border-blue-500 transition-all duration-200'
													{...field}
												/>
											</FormControl>
											<Button
												type='submit'
												disabled={
													loadingStates.submittingCategory ||
													!field.value.trim()
												}
												className='absolute right-1 top-1 h-8 px-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md transition-all duration-200'>
												{loadingStates.submittingCategory ? (
													<Loader2 className='w-4 h-4 animate-spin' />
												) : (
													<Plus className='w-4 h-4' />
												)}
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</div>

				{/* 📋 Categories List */}
				<div className='flex-1 bg-white/30 dark:bg-black/10 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 p-4 overflow-hidden'>
					<div className='h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent'>
						{loadingStates.categories ? (
							<div className='space-y-3'>
								{[...Array(3)].map((_, index) => (
									<div key={index} className='flex items-center gap-3'>
										<div className='flex-1 h-10 bg-gray-200/50 dark:bg-gray-700/30 rounded-lg animate-pulse' />
										<div className='w-10 h-10 bg-gray-200/50 dark:bg-gray-700/30 rounded-lg animate-pulse' />
									</div>
								))}
							</div>
						) : taskCategoriesData.length > 0 ? (
							<div className='space-y-3'>
								{taskCategoriesData.map((categoryItem) => {
									const usedInTasks = getCategoryUsage(categoryItem._id);
									return (
										<div
											key={categoryItem._id}
											className='flex items-center gap-3 p-3 bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/30 transition-all duration-200 group'>
											<Input
												value={categoryItem.category}
												disabled
												className='flex-1 bg-transparent border-none text-gray-800 dark:text-gray-200 font-medium'
											/>
											<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
												<Button
													variant='ghost'
													size='sm'
													onClick={() =>
														handleCopyToClipboard(categoryItem._id)
													}
													className='hover:bg-blue-100 dark:hover:bg-blue-900/30'
													title='Copy Category ID'>
													<Clipboard className='w-4 h-4 text-blue-600' />
												</Button>

												<Dialog
													open={
														categoryDialogOpen &&
														editingCategory === categoryItem._id
													}
													onOpenChange={(open) => {
														setCategoryDialogOpen(open);
														if (!open) setEditingCategory(null);
													}}>
													<DialogTrigger asChild>
														<Button
															variant='ghost'
															size='sm'
															onClick={() =>
																openCategoryEditDialog(categoryItem)
															}
															className='hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
															title='Edit Category'>
															<Edit className='w-4 h-4 text-yellow-600' />
														</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Edit Category</DialogTitle>
															<DialogDescription>
																Update the category name below.
															</DialogDescription>
														</DialogHeader>
														<Form {...categoryEditForm}>
															<form
																onSubmit={categoryEditForm.handleSubmit(
																	handleCategoryEdit,
																)}
																className='space-y-4'>
																<FormField
																	control={categoryEditForm.control}
																	name='category'
																	render={({ field }) => (
																		<FormItem>
																			<FormLabel>Category Name</FormLabel>
																			<FormControl>
																				<Input
																					placeholder='Enter category name...'
																					{...field}
																				/>
																			</FormControl>
																			<FormMessage />
																		</FormItem>
																	)}
																/>
																<DialogFooter>
																	<Button
																		type='button'
																		variant='outline'
																		onClick={() => {
																			setCategoryDialogOpen(false);
																			setEditingCategory(null);
																		}}>
																		Cancel
																	</Button>
																	<Button
																		type='submit'
																		disabled={loadingStates.updatingCategory}>
																		{loadingStates.updatingCategory ? (
																			<>
																				<Loader2 className='w-4 h-4 animate-spin mr-2' />
																				Updating...
																			</>
																		) : (
																			'Update'
																		)}
																	</Button>
																</DialogFooter>
															</form>
														</Form>
													</DialogContent>
												</Dialog>

												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant='ghost'
															size='sm'
															className='hover:bg-red-100 dark:hover:bg-red-900/30'
															title='Delete Category'>
															<Trash2 className='w-4 h-4 text-red-600' />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Delete Category
															</AlertDialogTitle>
															{usedInTasks.length > 0 ? (
																<div>
																	<AlertDialogDescription className='mb-2'>
																		This category is used by the following
																		tasks:
																	</AlertDialogDescription>
																	<ul className='list-disc list-inside space-y-1 mb-2'>
																		{usedInTasks.map((task) => (
																			<li key={task._id} className='text-sm'>
																				{task.task}
																			</li>
																		))}
																	</ul>
																	<p className='text-red-600 dark:text-red-400 font-medium'>
																		Cannot delete category while it's being used
																		by tasks.
																	</p>
																</div>
															) : (
																<AlertDialogDescription>
																	`Are you sure you want to delete "$
																	{categoryItem.category}"? This action cannot
																	be undone.`
																</AlertDialogDescription>
															)}
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																disabled={
																	usedInTasks.length > 0 ||
																	loadingStates.deletingCategory
																}
																onClick={() =>
																	handleCategoryDelete(categoryItem._id)
																}
																className='bg-red-600 hover:bg-red-700'>
																{loadingStates.deletingCategory ? (
																	<>
																		<Loader2 className='w-4 h-4 animate-spin mr-2' />
																		Deleting...
																	</>
																) : (
																	'Delete'
																)}
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center h-full text-center py-8'>
								<div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4'>
									<Tag className='w-8 h-8 text-blue-500' />
								</div>
								<h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>
									No Categories Yet
								</h3>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Create your first task category to get started
								</p>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* ✅ Task Management Section */}
			<section
				className='w-full lg:w-1/2 h-full flex flex-col'
				aria-label='Task Management'>
				{/* Enhanced header with gradient text */}
				<div className='mb-6'>
					<h2 className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2'>
						<CheckCircle2 className='w-6 h-6 text-purple-600' />
						Task Creation
					</h2>
					<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
						Create tasks and set recurring schedules
					</p>
				</div>

				{/* 📝 Task Creation Form */}
				<div className='bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 p-6 mb-6 shadow-lg'>
					<Form {...taskCreationForm}>
						<form
							onSubmit={taskCreationForm.handleSubmit(handleTaskFormSubmission)}
							className='space-y-4'>
							<FormField
								control={taskCreationForm.control}
								name='task'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
											Task Name
										</FormLabel>
										<FormControl>
											<Input
												placeholder='e.g., Complete project proposal...'
												className='bg-white/70 dark:bg-black/30 border-white/30 dark:border-white/20 focus:border-purple-500 transition-all duration-200'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={taskCreationForm.control}
								name='category'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
											Category ID
										</FormLabel>
										<FormControl>
											<Input
												placeholder='Paste category ID here...'
												className='bg-white/70 dark:bg-black/30 border-white/30 dark:border-white/20 focus:border-purple-500 transition-all duration-200'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className='space-y-3'>
								<FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2'>
									<Calendar className='w-4 h-4' />
									Repeat Schedule
								</FormLabel>
								<div className='flex flex-wrap gap-2'>
									{DAYS_OF_WEEK.map((dayConfig) => (
										<FormField
											key={dayConfig.key}
											control={taskCreationForm.control}
											name={
												dayConfig.key as keyof z.infer<typeof TaskFormSchema>
											}
											render={({ field }) => (
												<FormItem className='flex items-center space-y-0'>
													<FormControl>
														<Checkbox
															checked={field.value as boolean}
															onCheckedChange={field.onChange}
															className='sr-only'
														/>
													</FormControl>
													<FormLabel
														className='cursor-pointer'
														title={`Toggle ${dayConfig.full}`}>
														<Badge
															variant={field.value ? 'default' : 'outline'}
															className={cn(
																'transition-all duration-200 hover:scale-105',
																field.value
																	? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
																	: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
															)}>
															{dayConfig.label}
														</Badge>
													</FormLabel>
												</FormItem>
											)}
										/>
									))}
								</div>
								<p className='text-xs text-gray-500 dark:text-gray-400'>
									Select days when this task should repeat
								</p>
							</div>

							<Button
								type='submit'
								disabled={loadingStates.submittingTask}
								className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200'>
								{loadingStates.submittingTask ? (
									<>
										<Loader2 className='w-4 h-4 animate-spin mr-2' />
										Creating Task...
									</>
								) : (
									<>
										<Sparkles className='w-4 h-4 mr-2' />
										Create Task
									</>
								)}
							</Button>
						</form>
					</Form>
				</div>

				{/* 📋 Tasks List */}
				<div className='flex-1 bg-white/30 dark:bg-black/10 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/10 p-4 overflow-hidden'>
					<div className='h-full overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent'>
						{loadingStates.tasks ? (
							<div className='space-y-3'>
								{[...Array(4)].map((_, index) => (
									<div key={index} className='flex items-center gap-3 p-3'>
										<div className='flex-1 h-8 bg-gray-200/50 dark:bg-gray-700/30 rounded-lg animate-pulse' />
										<div className='w-24 h-8 bg-gray-200/50 dark:bg-gray-700/30 rounded-lg animate-pulse' />
									</div>
								))}
							</div>
						) : pendingTasksList.length > 0 ? (
							<div className='space-y-3'>
								{pendingTasksList.map((taskItem) => (
									<div
										key={taskItem._id}
										className='flex items-center gap-3 p-3 bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/30 transition-all duration-200 group'>
										<div className='flex-1'>
											<Input
												value={taskItem.task}
												disabled
												className='bg-transparent border-none text-gray-800 dark:text-gray-200 font-medium mb-1'
											/>
										</div>
										<div className='flex items-center gap-1 flex-wrap'>
											{taskItem?.repeat?.map(
												(dayAbbreviation, index) =>
													dayAbbreviation && (
														<Badge
															key={`${taskItem._id}-${index}`}
															variant='secondary'
															className='text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'>
															{dayAbbreviation.slice(0, 3)}
														</Badge>
													),
											)}
										</div>

										{/* Task Action Buttons */}
										<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
											<Dialog
												open={taskDialogOpen && editingTask === taskItem._id}
												onOpenChange={(open) => {
													setTaskDialogOpen(open);
													if (!open) setEditingTask(null);
												}}>
												<DialogTrigger asChild>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => openTaskEditDialog(taskItem)}
														className='hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
														title='Edit Task'>
														<Edit className='w-4 h-4 text-yellow-600' />
													</Button>
												</DialogTrigger>
												<DialogContent className='max-w-md'>
													<DialogHeader>
														<DialogTitle>Edit Task</DialogTitle>
														<DialogDescription>
															Update the task details below.
														</DialogDescription>
													</DialogHeader>
													<Form {...taskEditForm}>
														<form
															onSubmit={taskEditForm.handleSubmit(
																handleTaskEdit,
															)}
															className='space-y-4'>
															<FormField
																control={taskEditForm.control}
																name='task'
																render={({ field }) => (
																	<FormItem>
																		<FormLabel>Task Name</FormLabel>
																		<FormControl>
																			<Input
																				placeholder='Enter task name...'
																				{...field}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>

															<FormField
																control={taskEditForm.control}
																name='category'
																render={({ field }) => (
																	<FormItem>
																		<FormLabel>Category ID</FormLabel>
																		<FormControl>
																			<Input
																				placeholder='Enter category ID...'
																				{...field}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>

															<div className='space-y-3'>
																<FormLabel className='text-sm font-medium'>
																	Repeat Schedule
																</FormLabel>
																<div className='flex flex-wrap gap-2'>
																	{DAYS_OF_WEEK.map((dayConfig) => (
																		<FormField
																			key={dayConfig.key}
																			control={taskEditForm.control}
																			name={
																				dayConfig.key as keyof z.infer<
																					typeof TaskFormSchema
																				>
																			}
																			render={({ field }) => (
																				<FormItem className='flex items-center space-y-0'>
																					<FormControl>
																						<Checkbox
																							checked={field.value as boolean}
																							onCheckedChange={field.onChange}
																							className='sr-only'
																						/>
																					</FormControl>
																					<FormLabel
																						className='cursor-pointer'
																						title={`Toggle ${dayConfig.full}`}>
																						<Badge
																							variant={
																								field.value
																									? 'default'
																									: 'outline'
																							}
																							className={cn(
																								'transition-all duration-200 hover:scale-105',
																								field.value
																									? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
																									: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
																							)}>
																							{dayConfig.label}
																						</Badge>
																					</FormLabel>
																				</FormItem>
																			)}
																		/>
																	))}
																</div>
															</div>

															<DialogFooter>
																<Button
																	type='button'
																	variant='outline'
																	onClick={() => {
																		setTaskDialogOpen(false);
																		setEditingTask(null);
																	}}>
																	Cancel
																</Button>
																<Button
																	type='submit'
																	disabled={loadingStates.updatingTask}>
																	{loadingStates.updatingTask ? (
																		<>
																			<Loader2 className='w-4 h-4 animate-spin mr-2' />
																			Updating...
																		</>
																	) : (
																		'Update'
																	)}
																</Button>
															</DialogFooter>
														</form>
													</Form>
												</DialogContent>
											</Dialog>

											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant='ghost'
														size='sm'
														className='hover:bg-red-100 dark:hover:bg-red-900/30'
														title='Delete Task'>
														<Trash2 className='w-4 h-4 text-red-600' />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Delete Task</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to delete "{taskItem.task}"?
															This action cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															disabled={loadingStates.deletingTask}
															onClick={() => handleTaskDelete(taskItem._id)}
															className='bg-red-600 hover:bg-red-700'>
															{loadingStates.deletingTask ? (
																<>
																	<Loader2 className='w-4 h-4 animate-spin mr-2' />
																	Deleting...
																</>
															) : (
																'Delete'
															)}
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='flex flex-col items-center justify-center h-full text-center py-8'>
								<div className='w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4'>
									<CheckCircle2 className='w-8 h-8 text-purple-500' />
								</div>
								<h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>
									No Tasks Yet
								</h3>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Create your first task to start tracking progress
								</p>
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	);
};

// 🎨 Enhanced reusable components
const LabelInputContainer: React.FC<{
	children: React.ReactNode;
	className?: string;
}> = ({ children, className }) => {
	return (
		<div className={cn('flex w-full flex-col space-y-2', className)}>
			{children}
		</div>
	);
};

export default TaskCategoryManagementPage;
