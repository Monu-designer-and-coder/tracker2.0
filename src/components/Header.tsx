'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DarkModeSwitch from './dark-mode-switch';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetTrigger,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import axios, { AxiosResponse } from 'axios';
import { getSubjectResponse } from '@/types/res/GetResponse.types';
import {
	updateSubjects,
	updateSubjectWiseChapters,
} from '@/reducers/data.slice';
import { useAppDispatch } from '@/hooks/actions';
import { getSubjectWiseChapterResponse } from './../types/res/GetResponse.types';

function Header({ className = '' }: { className?: String }) {
	const [open, setOpen] = useState(false);

	const dispatch = useAppDispatch();

	useEffect(() => {
		// Get All Subject List
		axios
			.get('/api/subjects')
			.then((response: AxiosResponse<getSubjectResponse[]>) => {
				dispatch(updateSubjects(response.data));
				window.localStorage.setItem('subjects', JSON.stringify(response.data));
			});
		axios
			.get('/api/chapters?type=subjectWise')
			.then((response: AxiosResponse<getSubjectWiseChapterResponse[]>) => {
				dispatch(updateSubjectWiseChapters(response.data));
				window.localStorage.setItem(
					'subjectWiseChapters',
					JSON.stringify(response.data),
				);
			});
	}, []);

	return (
		<header
			className={`flex justify-between items-center p-4 py-8 w-full bg-zinc-300 dark:bg-zinc-950 ${className}`}>
			<section className='dark:text-white font-bold text-3xl'>
				JEE PROGRESS
			</section>

			{/* Desktop Menu */}
			<nav className='hidden md:flex gap-6 dark:text-white'>
				<Link href='/'>Home</Link>
				<Link href='/dashboard'>Dashboard</Link>
			</nav>

			{/* Mobile Hamburger Menu using Sheet from ShadCN */}
			<div className='md:hidden'>
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetTrigger asChild>
						<Button variant='outline'>☰</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>JEE Progress</SheetTitle>
						</SheetHeader>
						<nav className='flex flex-col gap-4 mt-8 text-lg dark:text-white p-4'>
							<Link
								className='w-full border border-y-1 border-x-0 p-10'
								href='/'
								onClick={() => setOpen(false)}>
								Home
							</Link>
							<Link
								className='w-full border border-y-1 border-x-0 p-10'
								href='/dashboard'
								onClick={() => setOpen(false)}>
								Dashboard
							</Link>
						</nav>
						<SheetFooter>
							<SheetClose asChild>
								<Button variant='outline'>Close</Button>
							</SheetClose>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			</div>

			{/* Dark Mode Toggle */}
			<aside className='ml-4'>
				<DarkModeSwitch />
			</aside>
		</header>
	);
}

export default Header;
