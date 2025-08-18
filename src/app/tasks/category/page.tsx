'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	FormField,
	Form,
	FormItem,
	FormLabel,
	FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
	TaskCategorySchema,
	TaskFormSchema,
	TaskSchema,
} from '@/schema/tasks.schema';
import {
	getTaskCategoryResponse,
	getTaskResponse,
} from '@/types/res/GetResponse.types';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Clipboard } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const page = () => {
	const [taskCategories, setTaskCategories] = useState<
		getTaskCategoryResponse[]
	>([]);
	const [tasksList, setTasksList] = useState<getTaskResponse[]>([]);

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
	const tasksForm = useForm<z.infer<typeof TaskFormSchema>>({
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
	});
	useEffect(() => {
		axios.get('/api/tasks/category').then((res) => setTaskCategories(res.data));
		axios.get('/api/tasks/task').then((res) => setTasksList(res.data));
	}, []);
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
				const newArray = new Array(...taskCategories);
				newArray.push({
					_id: response.data._id,
					category: response.data.category,
				});
				setTaskCategories(newArray);
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				taskCategoryForm.setValue('category', '');
			});
	}
	function taskFormOnSubmit(values: z.infer<typeof TaskFormSchema>) {
		config.method = 'post';
		const repeatArray = new Array();

		if (values.sunday === true) {
			repeatArray.push('sunday');
		}
		if (values.monday === true) {
			repeatArray.push('monday');
		}
		if (values.tuesday === true) {
			repeatArray.push('tuesday');
		}
		if (values.wednesday === true) {
			repeatArray.push('wednesday');
		}
		if (values.thursday === true) {
			repeatArray.push('thursday');
		}
		if (values.friday === true) {
			repeatArray.push('friday');
		}
		if (values.saturday === true) {
			repeatArray.push('saturday');
		}
		if (
			!(
				values?.sunday ||
				values?.monday ||
				values?.tuesday ||
				values?.wednesday ||
				values?.thursday ||
				values?.friday ||
				values?.saturday
			)
		) {
			repeatArray.push('');
		}

		const payloadData: z.infer<typeof TaskSchema> = {
			task: values.task,
			category: values.category,
			repeat: repeatArray,
		};

		config.data = payloadData;
		config.url = '/api/tasks/task';
		axios
			.request(config)
			.then((response) => {
				const newArray = new Array(...tasksList);
				newArray.push({
					task: response.data.task,
					_id: response.data._id,
					category: response.data.category,
					repeat: response.data.repeat,
				});
				setTasksList(newArray);
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				tasksForm.setValue('task', '');
				tasksForm.setValue('category', '');
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
					{taskCategories?.map((category) => (
						<div
							key={category._id}
							className='flex w-full items-center justify-center'>
							<Input value={category.category} disabled />
							<Button
								onClick={() => navigator.clipboard.writeText(category._id)}>
								<Clipboard strokeWidth={1.75} />
							</Button>
						</div>
					))}
				</div>
			</section>
			<section className='w-1/2 h-full p-4 flex flex-col items-center justify-center'>
				<div className='w-full h-[30%]  '>
					<Form {...tasksForm}>
						<form
							onSubmit={tasksForm.handleSubmit(taskFormOnSubmit)}
							className='relative'>
							<FormField
								control={tasksForm.control}
								name='task'
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
							<FormField
								control={tasksForm.control}
								name='category'
								render={({ field }) => (
									<FormItem>
										<LabelInputContainer>
											<FormLabel>Category</FormLabel>
											<FormControl>
												<Input placeholder='Category' {...field} />
											</FormControl>
										</LabelInputContainer>
									</FormItem>
								)}
							/>
							<div className='flex flex-wrap items-center justify-center w-full gap-1.5'>
								<FormField
									control={tasksForm.control}
									name='sunday'
									render={({ field }) => (
										<FormItem className='flex items-center justify-center'>
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
													className='hidden capitalize'
												/>
											</FormControl>
											<FormLabel className='text-sm font-normal capitalize'>
												<Badge variant={field.value ? 'default' : 'outline'}>
													sunday
												</Badge>
											</FormLabel>
										</FormItem>
									)}
								/>
								<FormField
									control={tasksForm.control}
									name='monday'
									render={({ field }) => (
										<FormItem className='flex flex-row items-center gap-2'>
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
													className='hidden capitalize'
												/>
											</FormControl>
											<FormLabel className='text-sm font-normal capitalize'>
												<Badge variant={field.value ? 'default' : 'outline'}>
													monday
												</Badge>
											</FormLabel>
										</FormItem>
									)}
								/>
								<FormField
									control={tasksForm.control}
									name='tuesday'
									render={({ field }) => (
										<FormItem className='flex flex-row items-center gap-2'>
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
													className='hidden capitalize'
												/>
											</FormControl>
											<FormLabel className='text-sm font-normal capitalize'>
												<Badge variant={field.value ? 'default' : 'outline'}>
													tuesday
												</Badge>
											</FormLabel>
										</FormItem>
									)}
								/>
								<FormField
									control={tasksForm.control}
									name='wednesday'
									render={({ field }) => (
										<FormItem className='flex flex-row items-center gap-2'>
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
													className='hidden capitalize'
												/>
											</FormControl>
											<FormLabel className='text-sm font-normal capitalize'>
												<Badge variant={field.value ? 'default' : 'outline'}>
													wednesday
												</Badge>
											</FormLabel>
										</FormItem>
									)}
								/>
								<FormField
									control={tasksForm.control}
									name='thursday'
									render={({ field }) => (
										<FormItem className='flex flex-row items-center gap-2'>
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
													className='hidden capitalize'
												/>
											</FormControl>
											<FormLabel className='text-sm font-normal capitalize'>
												<Badge variant={field.value ? 'default' : 'outline'}>
													thursday
												</Badge>
											</FormLabel>
										</FormItem>
									)}
								/>
								<FormField
									control={tasksForm.control}
									name='friday'
									render={({ field }) => (
										<FormItem className='flex flex-row items-center gap-2'>
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
													className='hidden capitalize'
												/>
											</FormControl>
											<FormLabel className='text-sm font-normal capitalize'>
												<Badge variant={field.value ? 'default' : 'outline'}>
													friday
												</Badge>
											</FormLabel>
										</FormItem>
									)}
								/>
								<FormField
									control={tasksForm.control}
									name='saturday'
									render={({ field }) => (
										<FormItem className='flex flex-row items-center gap-2'>
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
													className='hidden capitalize'
												/>
											</FormControl>
											<FormLabel className='text-sm font-normal capitalize'>
												<Badge variant={field.value ? 'default' : 'outline'}>
													saturday
												</Badge>
											</FormLabel>
										</FormItem>
									)}
								/>
							</div>
							<button
								type='submit'
								className='absolute right-0.5 top-0.5 px-2 py-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200'>
								ADD
							</button>
						</form>
					</Form>
				</div>
				<div className='w-11/12 h-[70%] flex items-center justify-around flex-col gap-3  overflow-y-scroll'>
					{tasksList
						?.filter((task) => task.done === undefined)
						?.map((task) => (
							<div
								key={task._id}
								className='flex w-full items-center justify-center'>
								<Input value={task.task} disabled />
								<div className='flex w-1/3 items-center justify-center flex-wrap'>
									{task?.repeat?.map((day) => (
										<Badge key={day}>
											{day.charAt(0)}
											{day.charAt(1)}
											{day.charAt(2)}
										</Badge>
									))}
								</div>
							</div>
						))}
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
