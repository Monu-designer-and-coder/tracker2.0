'use client';
import { useAppSelector } from '@/hooks/actions';
import React, { useEffect } from 'react';

const page = () => {
	const subjectWiseChapters = useAppSelector(
		(state) => state.data.subjectWiseChapters,
	);
	useEffect(() => {
		console.log(subjectWiseChapters);
	}, [subjectWiseChapters]);
	return <div>Chapters</div>;
};

export default page;
