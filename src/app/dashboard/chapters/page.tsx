'use client';
import { AnimatedTabs } from '@/components/ui/animated-tabs';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Meteors } from '@/components/ui/meteors';
import { MovingBorderElement } from '@/components/ui/moving-border';
import { useAppSelector } from '@/hooks/actions';
import { getSubjectWiseChapterResponse } from '@/types/res/GetResponse.types';
import React, { useEffect, useState } from 'react';

const page = () => {
	interface Tab {
		title: string;
		value: string;
		content?: string | React.ReactNode | any;
	}

	const [tabs, setTabs] = useState<Tab[]>([
		{
			title: 'Product',
			value: 'product',
			content: (
				<div>
					<button className='px-8 py-2 rounded-full bg-gradient-to-b from-red-500 to-red-600 text-white focus:ring-2 focus:ring-red-400 hover:shadow-xl transition duration-200'>
						LOADING...
					</button>
					<button className='px-8 py-2 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 text-white focus:ring-2 focus:ring-emerald-400 hover:shadow-xl transition duration-200'>
						LOADING...
					</button>
				</div>
			),
		},
	]);

	const subjectWiseChapters = useAppSelector(
		(state) => state.data.subjectWiseChapters,
	);
	useEffect(() => {
		console.log(subjectWiseChapters);
		const tabsList: Tab[] = subjectWiseChapters.map((subject) => ({
			title: subject.name + ' - ' + subject.standard,
			value: subject._id,
			content: (
				<div className='relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3 bg-stone-200 dark:bg-stone-900'>
					<GlowingEffect
						blur={10}
						borderWidth={10}
						spread={45}
						glow={true}
						disabled={false}
						proximity={94}
						inactiveZone={0.99}
					/>
					<SubjectContent subject={subject} />
				</div>
			),
		}));
		setTabs(tabsList);
	}, [subjectWiseChapters]);
	return (
		<div className='h-[95vh] [perspective:1000px] relative b flex flex-col max-w-5xl mx-auto w-full  items-start justify-start'>
			<AnimatedTabs tabs={tabs} />
		</div>
	);
};

export default page;

const SubjectContent = ({
	subject,
}: {
	subject: getSubjectWiseChapterResponse;
}) => {
	return (
		<div className='border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden overflow-y-scroll rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]'>
			<div className='relative flex flex-1 flex-col justify-between gap-3'>
				<div className='w-fit rounded-lg border border-gray-600 p-2'>
					{subject.name} - {subject.standard}
				</div>
				<ul>
					{subject.chapterList.map((chapter) => {
						function getColor(bool: boolean) {
							if (bool) {
								return 'emerald';
							}
							return 'red';
						}
						return (
							<MovingBorderElement
								as={'li'}
								key={chapter._id}
								containerClassName='w-5/5'>
								{chapter.seqNumber}. {chapter.name}
								<button
									className={` px-3 py-2 rounded-full bg-gradient-to-b from-${getColor(
										chapter.done,
									)}-500 to-${getColor(
										chapter.done,
									)}-600 text-white focus:ring-2 focus:ring-${getColor(
										chapter.done,
									)}-400 hover:shadow-xl transition duration-200`}>
									Lectures/Notes
								</button>
								<button
									className={` px-3 py-2 rounded-full bg-gradient-to-b from-${getColor(
										chapter.selectionDiary,
									)}-500 to-${getColor(
										chapter.selectionDiary,
									)}-600 text-white focus:ring-2 focus:ring-${getColor(
										chapter.selectionDiary,
									)}-400 hover:shadow-xl transition duration-200`}>
									selectionDiary
								</button>
								<button
									className={` px-3 py-2 rounded-full bg-gradient-to-b from-${getColor(
										chapter.onePager,
									)}-500 to-${getColor(
										chapter.onePager,
									)}-600 text-white focus:ring-2 focus:ring-${getColor(
										chapter.onePager,
									)}-400 hover:shadow-xl transition duration-200`}>
									onePager
								</button>
								<button
									className={` px-3 py-2 rounded-full bg-gradient-to-b from-${getColor(
										chapter.PYQ,
									)}-500 to-${getColor(
										chapter.PYQ,
									)}-600 text-white focus:ring-2 focus:ring-${getColor(
										chapter.PYQ,
									)}-400 hover:shadow-xl transition duration-200`}>
									PYQ
								</button>
								<button
									className={` px-3 py-2 rounded-full bg-gradient-to-b from-${getColor(
										chapter.Module,
									)}-500 to-${getColor(
										chapter.Module,
									)}-600 text-white focus:ring-2 focus:ring-${getColor(
										chapter.Module,
									)}-400 hover:shadow-xl transition duration-200`}>
									Module
								</button>
								<button
									className={` px-3 py-2 rounded-full bg-gradient-to-b from-${getColor(
										chapter.ExtraMaterial,
									)}-500 to-${getColor(
										chapter.ExtraMaterial,
									)}-600 text-white focus:ring-2 focus:ring-${getColor(
										chapter.ExtraMaterial,
									)}-400 hover:shadow-xl transition duration-200`}>
									ExtraMaterial
								</button>
								<button
									className={` px-3 py-2 rounded-full bg-gradient-to-b from-${getColor(
										chapter.DPP,
									)}-500 to-${getColor(
										chapter.DPP,
									)}-600 text-white focus:ring-2 focus:ring-${getColor(
										chapter.DPP,
									)}-400 hover:shadow-xl transition duration-200`}>
									DPP
								</button>
							</MovingBorderElement>
						);
					})}
				</ul>
				<div className='space-y-3'>
					<h3 className='-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white'>
						Total Chapter:{' '}
					</h3>
					<h2 className='font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold'>
						{subject.chapterList.length}
					</h2>
				</div>
			</div>
			<Meteors number={10} />
		</div>
	);
};
