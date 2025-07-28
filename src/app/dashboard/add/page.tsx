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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

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
							<CardTitle>Add Subjects</CardTitle>
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
												<FormLabel>Name</FormLabel>
												<FormControl>
													<Input placeholder='Subject' {...field} />
												</FormControl>
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
												<FormLabel>Standard</FormLabel>
												<FormControl>
													<Input placeholder='Standard' {...field} />
												</FormControl>
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
				<TabsContent value='chapter'>Change your chapter here.</TabsContent>
				<TabsContent value='topics'>Change your topics here.</TabsContent>
			</Tabs>
		</section>
	);
};

export default page;
