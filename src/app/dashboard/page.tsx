'use client';

import {
	CloseIcon,
	ExpandableCardInterface,
} from '@/components/ui/expandable-card';
import { getSubjectResponse } from '@/types/res/GetResponse.types';
import axios, { AxiosResponse } from 'axios';
import React, { RefObject, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { useSelector } from 'react-redux';

const page = () => {
	const subjectListFromStore: getSubjectResponse[] = useSelector(
		(state: { subjects: getSubjectResponse[] }) => state.subjects,
	);
	const [subjectList, setSubjectList] =
		useState<getSubjectResponse[]>(subjectListFromStore);

	const [subjectListCards, setSubjectLIstCard] = useState<
		ExpandableCardInterface[]
	>([
		{
			id: 'loading',
			description: '',
			title: '',
			ctaText: '',
			content: () => {
				return <p>Loading...</p>;
			},
		},
	]);

	useEffect(function () {
		const subjectListFromLocalStorageString: string =
			window.localStorage.getItem('subjects') as string;
		const subjectListObject: getSubjectResponse[] = JSON.parse(
			subjectListFromLocalStorageString,
		);
		setSubjectList(subjectListObject);
	}, []);

	useEffect(() => {
		if (subjectList?.length == 0 || !subjectList?.length) return;
		const cards = subjectList?.map((subject) => ({
			id: subject._id,
			description: `Class- ${subject.standard}`,
			title: subject.name,
			src: 'https://images.unsplash.com/photo-1622323758558-8d1513e61e9b?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
			ctaText: 'Overview',
			ctaLink: 'https://ui.aceternity.com/templates',
			content: () => {
				return <p>Will update Later!!!</p>;
			},
		}));
		setSubjectLIstCard(cards);
	}, [subjectList]);

	const [active, setActive] = useState<
		ExpandableCardInterface[][number] | boolean | null
	>(null);
	const ref = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
	const id = useId();

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setActive(false);
			}
		}

		if (active && typeof active === 'object') {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [active]);

	useOutsideClick(ref, () => setActive(null));

	return (
		<div>
			<AnimatePresence>
				{active && typeof active === 'object' && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 bg-black/20 h-full w-full z-10'
					/>
				)}
			</AnimatePresence>
			<AnimatePresence>
				{active && typeof active === 'object' ? (
					<div className='fixed inset-0  grid place-items-center z-[100]'>
						<motion.button
							key={`button-${active.id}-${id}`}
							layout
							initial={{
								opacity: 0,
							}}
							animate={{
								opacity: 1,
							}}
							exit={{
								opacity: 0,
								transition: {
									duration: 0.05,
								},
							}}
							className='flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6'
							onClick={() => setActive(null)}>
							<CloseIcon />
						</motion.button>
						<motion.div
							layoutId={`card-${active.id}-${id}`}
							ref={ref}
							className='w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden'>
							<motion.div layoutId={`image-${active.id}-${id}`}>
								<img
									width={200}
									height={200}
									src={active.src}
									alt={active.title}
									className='w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top'
								/>
							</motion.div>

							<div>
								<div className='flex justify-between items-start p-4'>
									<div className=''>
										<motion.h3
											layoutId={`title-${active.id}-${id}`}
											className='font-bold text-neutral-700 dark:text-neutral-200'>
											{active.title}
										</motion.h3>
										<motion.p
											layoutId={`description-${active.id}-${id}`}
											className='text-neutral-600 dark:text-neutral-400'>
											{active.description}
										</motion.p>
									</div>

									<motion.a
										layoutId={`button-${active.id}-${id}`}
										href={active.ctaLink}
										target='_blank'
										className='px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white'>
										{active.ctaText}
									</motion.a>
								</div>
								<div className='pt-4 relative px-4'>
									<motion.div
										layout
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className='text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]'>
										{typeof active.content === 'function'
											? active.content()
											: active.content}
									</motion.div>
								</div>
							</div>
						</motion.div>
					</div>
				) : null}
			</AnimatePresence>
			<ul className='max-w-2xl mx-auto w-full gap-4'>
				{subjectListCards.map((card) => {
					return (
						<motion.div
							layoutId={`card-${card.id}-${id}`}
							key={`card-${card.id}-${id}`}
							onClick={() => setActive(card)}
							className='p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer'>
							<div className='flex gap-4 flex-col md:flex-row '>
								<motion.div layoutId={`image-${card.id}-${id}`}>
									<img
										width={100}
										height={100}
										src={card.src}
										alt={card.title}
										className='h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top'
									/>
								</motion.div>
								<div className=''>
									<motion.h3
										layoutId={`title-${card.id}-${id}`}
										className='font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left'>
										{card.title}
									</motion.h3>
									<motion.p
										layoutId={`description-${card.id}-${id}`}
										className='text-neutral-600 dark:text-neutral-400 text-center md:text-left'>
										{card.description}
									</motion.p>
								</div>
							</div>
							<motion.button
								layoutId={`button-${card.id}-${id}`}
								className='px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0'>
								{card.ctaText}
							</motion.button>
						</motion.div>
					);
				})}
			</ul>
		</div>
	);
};

export default page;
