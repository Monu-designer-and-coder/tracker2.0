'use client';

import { Button } from '@/components/ui/button';
import {
	FormField,
	Form,
	FormItem,
	FormLabel,
	FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TaskCategorySchema, TaskSchema } from '@/schema/tasks.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const page = () => {
	//* Axios Config
	const config = {
		method: '',
		maxBodyLength: Infinity,
		url: '',
		headers: {},
		data: {},
	};
	//* Defining the Forms to use react-hook-form
	const taskCategoryForm = useForm<z.infer<typeof TaskCategorySchema>>({
		resolver: zodResolver(TaskCategorySchema),
		defaultValues: {
			category: '',
		},
	});
	const tasksForm = useForm<z.infer<typeof TaskSchema>>({
		resolver: zodResolver(TaskSchema),
		defaultValues: {
			task: '',
			category: '',
			done: false,
			repeat: [''],
		},
	});
	//* Defining the SubmitHandlers
	function taskCategoryFormOnSubmit(
		values: z.infer<typeof TaskCategorySchema>,
	) {
		config.method = 'post';
		config.data = values;
		config.url = '/api/tasks/category';
		axios
			.request(config)
			.then((response) => {
				console.log(JSON.stringify(response.data));
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				taskCategoryForm.setValue('category', '');
			});
	}
	function taskFormOnSubmit(
		values: z.infer<typeof TaskSchema>,
	) {
		config.method = 'post';
		config.data = values;
		config.url = '/api/tasks/task';
		axios
			.request(config)
			.then((response) => {
				console.log(JSON.stringify(response.data));
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				taskCategoryForm.setValue('category', '');
			});
	}
	return (
		<div className='flex justify-between gap-3 items-center w-11/12 h-full'>
			<section className='w-1/2 h-full p-4 flex flex-col items-center justify-center'>
				<div className='w-full h-[10%] '>
					<Form {...taskCategoryForm}>
						<form
							onSubmit={taskCategoryForm.handleSubmit(taskCategoryFormOnSubmit)}
							className='space-y-8 relative'>
							<FormField
								control={taskCategoryForm.control}
								name='category'
								render={({ field }) => (
									<FormItem>
										<LabelInputContainer>
											<FormLabel>Task Category</FormLabel>
											<FormControl>
												<Input placeholder='Task' {...field} />
											</FormControl>
										</LabelInputContainer>
									</FormItem>
								)}
							/>
							<button
								type='submit'
								className='absolute right-0.5 top-0.5 px-2 py-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200'>
								ADD
							</button>
						</form>
					</Form>
				</div>
				<div className='w-11/12 h-[90%] flex items-center justify-center flex-col gap-3'>
					<Input />
				</div>
			</section>
			<section className='w-1/2 h-full p-4 flex flex-col items-center justify-center'>
				<div className='w-full h-[10%] '>
					<Form {...taskCategoryForm}>
						<form
							onSubmit={taskCategoryForm.handleSubmit(taskCategoryFormOnSubmit)}
							className='space-y-8 relative'>
							<FormField
								control={taskCategoryForm.control}
								name='category'
								render={({ field }) => (
									<FormItem>
										<LabelInputContainer>
											<FormLabel>Task</FormLabel>
											<FormControl>
												<Input placeholder='Task' {...field} />
											</FormControl>
										</LabelInputContainer>
									</FormItem>
								)}
							/>
							<button
								type='submit'
								className='absolute right-0.5 top-0.5 px-2 py-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200'>
								ADD
							</button>
						</form>
					</Form>
				</div>
				<div className='w-11/12 h-[90%] flex items-center justify-center flex-col gap-3'>
					<Input />
				</div>
			</section>
		</div>
	);
};

export default page;

const LabelInputContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div className={cn('flex w-full flex-col space-y-2 ', className)}>
			{children}
		</div>
	);
};
