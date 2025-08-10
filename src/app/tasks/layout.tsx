'use client';

import React from 'react';
import { FloatingDock } from '@/components/ui/floating-dock';
import {
	FcTodoList,
	FcParallelTasks,
	FcSalesPerformance,
} from 'react-icons/fc';

export default function Layout({ children }: { children: React.ReactNode }) {
	const links = [
		{
			title: 'Categories',
			icon: (
				<FcParallelTasks className='h-full w-full text-neutral-500 dark:text-neutral-300' />
			),
			href: '/tasks/category',
		},
		{
			title: 'Home',
			icon: (
				<FcTodoList className='h-full w-full text-neutral-500 dark:text-neutral-300' />
			),
			href: '/tasks',
		},
		{
			title: 'Tracker',
			icon: (
				<FcSalesPerformance className='h-full w-full text-neutral-500 dark:text-neutral-300' />
			),
			href: '/tasks/category',
		},
	];

	return (
		<main className=' flex items-center justify-center relative flex-col h-[90vh] w-full '>
			<section className='w-full h-full flex items-center justify-center'>
				{children}
			</section>
			<FloatingDock desktopClassName='fixed bottom-2' items={links} />
		</main>
	);
}
