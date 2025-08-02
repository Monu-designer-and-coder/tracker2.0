'use client';
import React, { useEffect, useState } from 'react';

import { z } from 'zod';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectValidationSchema } from '@/schema/subject.schema';
import { getSubjectResponse } from '@/types/res/GetResponse.types';
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
import { chapterValidationSchema } from '@/schema/chapter.schema';
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
import { cn } from '@/lib/utils';

const page = () => {
	//* Accessing the redux store
	const subjects: getSubjectResponse[] = useSelector(
		(state: { subjects: getSubjectResponse[] }) => state.subjects,
	);

	//* Defining the useStates
	const [subjectList, setSubjectList] =
		useState<getSubjectResponse[]>(subjects);

	//* Defining UseEffects
	useEffect(function () {
		const subjectListFromLocalStorageString: string =
			window.localStorage.getItem('subjects') as string;
		const subjectListObject: getSubjectResponse[] = JSON.parse(
			subjectListFromLocalStorageString,
		);
		setSubjectList(subjectListObject);
	}, []);

	//* Axios Config
	const config = {
		method: '',
		maxBodyLength: Infinity,
		url: '',
		headers: {},
		data: {},
	};

	//* Defining the Forms to use react-hook-form
	const subjectCreateForm = useForm<z.infer<typeof subjectValidationSchema>>({
		resolver: zodResolver(subjectValidationSchema),
		defaultValues: {
			name: '',
			standard: '',
		},
	});
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
	});

	//* Defining the SubmitHandlers
	function subjectOnSubmit(values: z.infer<typeof subjectValidationSchema>) {
		config.method = 'post';
		config.data = values;
		config.url = '/api/subjects';
		axios
			.request(config)
			.then((response) => {
				console.log(JSON.stringify(response.data));
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				subjectCreateForm.setValue('name', '');
				subjectCreateForm.setValue('standard', '');
			});
	}
	function chapterOnSubmit(values: z.infer<typeof chapterValidationSchema>) {
		config.method = 'POST';
		config.data = { ...values, seqNumber: Number(values.seqNumber) };
		config.url = '/api/chapters';
		axios
			.request(config)
			.then((response) => {
				console.log(JSON.stringify(response.data));
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => {
				chapterCreateForm.setValue('name', '');
				chapterCreateForm.setValue(
					'seqNumber',
					String(Number(chapterCreateForm.getValues('seqNumber')) + 1),
				);
			});
	}
	return (
		<section className='w-full flex justify-center items-center h-[90vh]'>
			<Tabs defaultValue='subject' className='w-[400px]'>
				<TabsList>
					<TabsTrigger value='subject'>subject</TabsTrigger>
					<TabsTrigger value='chapter'>chapter</TabsTrigger>
					<TabsTrigger value='topics'>topics</TabsTrigger>
				</TabsList>
				<TabsContent value='subject'>
					<Card>
						<CardHeader>
							<CardTitle>Subjects</CardTitle>
							<CardDescription>Add Subjects</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...subjectCreateForm}>
								<form
									onSubmit={subjectCreateForm.handleSubmit(subjectOnSubmit)}
									className='space-y-8'>
									<FormField
										control={subjectCreateForm.control}
										name='name'
										render={({ field }) => (
											<FormItem>
												<LabelInputContainer>
													<FormLabel>Name</FormLabel>
													<FormControl>
														<Input placeholder='Subject' {...field} />
													</FormControl>
												</LabelInputContainer>
												<FormDescription>
													This is the subject name.
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
												<LabelInputContainer>
													<FormLabel>Standard</FormLabel>
													<FormControl>
														<Input placeholder='Standard' {...field} />
													</FormControl>
												</LabelInputContainer>
												<FormDescription>This is the standard.</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button type='submit'>Submit</Button>
								</form>
							</Form>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value='chapter'>
					<Card>
						<CardHeader>
							<CardTitle>Chapter</CardTitle>
							<CardDescription>Add Chapter</CardDescription>
						</CardHeader>
						<CardContent className='space-y-2'>
							<Form {...chapterCreateForm}>
								<form
									onSubmit={chapterCreateForm.handleSubmit(chapterOnSubmit)}
									className='space-y-8'>
									<FormField
										control={chapterCreateForm.control}
										name='name'
										render={({ field }) => (
											<FormItem>
												<LabelInputContainer>
													<FormLabel>Name</FormLabel>
													<FormControl>
														<Input placeholder='Subject' {...field} />
													</FormControl>
												</LabelInputContainer>
												<FormDescription>
													This is the chapter name.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={chapterCreateForm.control}
										name='subject'
										render={({ field }) => (
											<FormItem>
												<LabelInputContainer>
													<FormLabel>Subject</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder='Select the Subject for the chapter' />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectGroup>
																<SelectLabel>XI</SelectLabel>
																{subjects
																	?.filter((value) => value.standard == 'XI')
																	.map((subject11) => (
																		<SelectItem
																			key={subject11._id}
																			value={subject11._id}>
																			{subject11.name} - {subject11.standard}
																		</SelectItem>
																	))}
															</SelectGroup>
															<SelectGroup>
																<SelectLabel>XII</SelectLabel>
																{subjects
																	?.filter((value) => value.standard == 'XII')
																	.map((subject12) => (
																		<SelectItem
																			key={subject12._id}
																			value={subject12._id}>
																			{subject12.name} - {subject12.standard}
																		</SelectItem>
																	))}
															</SelectGroup>
														</SelectContent>
													</Select>
												</LabelInputContainer>
												<FormDescription>
													This is the subject of the chapter.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={chapterCreateForm.control}
										name='seqNumber'
										render={({ field }) => (
											<FormItem>
												<LabelInputContainer>
													<FormLabel>Seq No.</FormLabel>
													<FormControl>
														<Input
															type='number'
															placeholder='Standard'
															{...field}
														/>
													</FormControl>
												</LabelInputContainer>
												<FormDescription>Enter the Seq No.</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className='mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2'>
										<FormField
											control={chapterCreateForm.control}
											name='selectionDiary'
											render={({ field }) => (
												<FormItem>
													<LabelInputContainer>
														<FormLabel>Selection Diary</FormLabel>
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</LabelInputContainer>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={chapterCreateForm.control}
											name='done'
											render={({ field }) => (
												<FormItem>
													<LabelInputContainer>
														<FormLabel>Completed</FormLabel>
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</LabelInputContainer>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={chapterCreateForm.control}
											name='DPP'
											render={({ field }) => (
												<FormItem>
													<LabelInputContainer>
														<FormLabel>DPP</FormLabel>
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</LabelInputContainer>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={chapterCreateForm.control}
											name='onePager'
											render={({ field }) => (
												<FormItem>
													<LabelInputContainer>
														<FormLabel>onePager</FormLabel>
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</LabelInputContainer>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className='mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2'>
										<FormField
											control={chapterCreateForm.control}
											name='PYQ'
											render={({ field }) => (
												<FormItem>
													<LabelInputContainer>
														<FormLabel>PYQ</FormLabel>
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</LabelInputContainer>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={chapterCreateForm.control}
											name='Module'
											render={({ field }) => (
												<FormItem>
													<LabelInputContainer>
														<FormLabel>Module</FormLabel>
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</LabelInputContainer>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={chapterCreateForm.control}
											name='ExtraMaterial'
											render={({ field }) => (
												<FormItem>
													<LabelInputContainer>
														<FormLabel>ExtraMaterial</FormLabel>
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</LabelInputContainer>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<Button type='submit'>Submit</Button>
								</form>
							</Form>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value='topics'>Change your topics here.</TabsContent>
			</Tabs>
		</section>
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
		<div
			className={cn(
				'flex w-full flex-col space-y-2 ',
				className,
			)}>
			{children}
		</div>
	);
};
