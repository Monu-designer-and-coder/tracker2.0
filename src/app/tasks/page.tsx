'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
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
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, CheckSquare, XSquare, Plus } from 'lucide-react'; // Using Lucide React for icons
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getTaskTrackerResponse } from '@/types/res/GetResponse.types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskPUTSchema, TaskSchema } from '@/schema/tasks.schema';
import z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { TaskModelInterface } from '@/model/task.model';
import { TaskTrackerModelInterface } from '@/model/task-tracker.model';

// Define a type for a todo item for clarity
interface Todo {
	id: string;
	text: string;
	completed: boolean;
}

// Main App Component
export default function App() {
	//* Axios Config
	const config: AxiosRequestConfig = {
		method: '',
		maxBodyLength: Infinity,
		url: '',
		headers: {},
		data: {},
	};

	const [todos, setTodos] = useState<Todo[]>([]);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
	const [editInputText, setEditInputText] = useState('');
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);

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

	// Handle adding a new todo
	const addTodo = (value: z.infer<typeof TaskSchema>) => {
		config.url = '/api/tasks/task';
		config.method = 'POST';
		config.data = {
			...value,
			assignDate: new Date(String(value.assignedDate)),
		};
		axios
			.request(config)
			.then((res: AxiosResponse<TaskModelInterface>) => {
				config.url = 'api/tasks/tracker';
				config.data = {
					date: new Date(String(res.data.assignedDate)),
					task: res.data._id,
					status: 'current',
				};
				axios
					.request(config)
					.then((response: AxiosResponse<TaskTrackerModelInterface>) => {
						setTodos((prevTodos) => [
							...prevTodos,
							{
								id: String(response.data.task),
								text: res.data.task,
								completed: false,
							},
						]);
						addTodoForm.setValue('task', '');
					})
					.catch((e) => console.log(e));
			})
			.catch((e) => console.log(e));
	};

	// Open the edit modal
	const openEditModal = (todo: Todo) => {
		editTodoForm.setValue('data.task', todo.text);
		editTodoForm.setValue('id', todo.id);
		setIsEditModalOpen(true);
	};

	// Handle saving edits
	const saveEdit = (value: z.infer<typeof TaskPUTSchema>) => {
		config.url = 'api/tasks/task';
		config.method = 'PUT';
		config.data = value;

		axios.request(config).then((res: AxiosResponse<TaskModelInterface>) => {
			setTodos((prevTodos) =>
				prevTodos.map((todo) =>
					todo.id === res.data._id ? { ...todo, text: res.data.task } : todo,
				),
			);
			console.log(res);
			console.log(
				todos.map((todo) =>
					todo.id == res.data._id ? { ...todo, text: res.data.task } : todo,
				),
			);
		});
		setIsEditModalOpen(false);
		editTodoForm.setValue('data.task', '');
		editTodoForm.setValue('id', '');
	};

	// Open delete confirmation modal
	const openDeleteModal = (id: string) => {
		setDeletingTodoId(id);
		setIsDeleteModalOpen(true);
	};

	// Confirm and delete todo
	const confirmDelete = () => {
		if (deletingTodoId) {
			config.url = `/api/tasks/task?id=${deletingTodoId}`;
			config.method = 'DELETE';
			axios.request(config).then(() => {
				setTodos((prevTodos) =>
					prevTodos.filter((todo) => todo.id !== deletingTodoId),
				);
			});
			setIsDeleteModalOpen(false);
			setDeletingTodoId(null);
		}
	};

	useEffect(() => {
		axios
			.get('/api/tasks/tracker?status=current')
			.then((response: AxiosResponse<getTaskTrackerResponse>) => {
				setTodos(
					response.data.taskDetails.map((task) => ({
						id: task._id,
						text: task.task,
						completed: task.done,
					})),
				);
			});
	}, []);

	//* Defining the Forms to use react-hook-form
	const addTodoForm = useForm<z.infer<typeof TaskSchema>>({
		resolver: zodResolver(TaskSchema),
		defaultValues: {
			task: '',
			category: '68a2a46e268e36c52a4e9b37',
			done: false,
			assignedDate: new Date(),
		},
	});
	const editTodoForm = useForm<z.infer<typeof TaskPUTSchema>>({
		resolver: zodResolver(TaskPUTSchema),
		defaultValues: {
			id: '',
			data: {
				task: '',
			},
		},
	});

	return (
		<div className='h-[95%] bg-slate-50 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 flex flex-col rounded-xl shadow dark:shadow-zinc-950 items-center p-4 w-11/12'>
			{/* Main Container */}
			<div className='w-full bg-white dark:bg-zinc-800 rounded-lg shadow-xl dark:shadow-zinc-800 p-6 sm:p-8 space-y-6 h-full'>
				<Form {...addTodoForm}>
					{/* Top Input Section */}
					<form
						onSubmit={addTodoForm.handleSubmit(addTodo)}
						className='flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 shadow-sm h-[20%]'>
						<FormField
							control={addTodoForm.control}
							name='task'
							render={({ field }) => (
								<Input
									type='text'
									placeholder='What needs to be done?'
									{...field}
									className='flex-grow rounded-md border-blue-200 dark:border-blue-700 focus:ring-blue-300 focus:border-blue-300 dark:focus:ring-blue-600 dark:focus:border-blue-600 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500'
								/>
							)}
						/>
						<Button
							type='submit'
							className='w-full sm:w-auto bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2'>
							<Plus className='h-4 w-4' /> Add Todo
						</Button>
					</form>
				</Form>

				{/* Main Todo List Display Area */}
				<div className='space-y-3 overflow-y-scroll h-[80%]'>
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
										{/* Edit Button */}
										<Button
											variant='outline'
											size='icon'
											onClick={() => openEditModal(todo)}
											className='rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/50 dark:hover:bg-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
											title='Edit todo'>
											<Pencil className='h-5 w-5' />
										</Button>

										{/* Delete Button */}
										<Button
											variant='outline'
											size='icon'
											onClick={() => openDeleteModal(todo.id)}
											className='rounded-full bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/50 dark:hover:bg-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
											title='Delete todo'>
											<Trash2 className='h-5 w-5' />
										</Button>
									</div>
								</CardContent>
							</Card>
						))
					)}
				</div>
			</div>

			{/* Edit Todo Modal */}
			<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<DialogContent className='sm:max-w-[425px] bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg shadow-xl'>
					<Form {...editTodoForm}>
						<form
							onSubmit={editTodoForm.handleSubmit(saveEdit)}
							className='w-full rounded-lg shadow-xl'>
							<DialogHeader>
								<DialogTitle className='text-blue-600 dark:text-blue-400'>
									Edit Todo
								</DialogTitle>
							</DialogHeader>
							<FormField
								control={editTodoForm.control}
								name='data.task'
								render={({ field }) => (
									<div className='grid gap-4 py-4'>
										<Label
											htmlFor='edit-todo-text'
											className='text-zinc-700 dark:text-zinc-200'>
											Todo Text
										</Label>
										<Input
											id='edit-todo-text'
											{...field}
											className='col-span-3 rounded-md border-blue-200 dark:border-blue-700 focus:ring-blue-300 focus:border-blue-300 dark:focus:ring-blue-600 dark:focus:border-blue-600 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100'
										/>
									</div>
								)}
							/>

							<DialogFooter className='flex flex-col sm:flex-row gap-2 sm:gap-0'>
								<Button
									variant='outline'
									onClick={() => setIsEditModalOpen(false)}
									className='w-full sm:w-auto rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-600'>
									Cancel
								</Button>
								<Button
									type='submit'
									className='w-full sm:w-auto bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md'>
									Save Changes
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Modal */}
			<AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<AlertDialogContent className='bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg shadow-xl'>
					<AlertDialogHeader>
						<AlertDialogTitle className='text-red-600 dark:text-red-400'>
							Are you absolutely sure?
						</AlertDialogTitle>
						<AlertDialogDescription className='text-zinc-600 dark:text-zinc-300'>
							This action cannot be undone. This will permanently delete your
							todo item from the list.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className='flex flex-col sm:flex-row-reverse gap-2 sm:gap-0'>
						<AlertDialogAction
							onClick={confirmDelete}
							className='w-full sm:w-auto bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-md'>
							Yes, delete todo
						</AlertDialogAction>
						<AlertDialogCancel className='w-full sm:w-auto rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-600'>
							Cancel
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
