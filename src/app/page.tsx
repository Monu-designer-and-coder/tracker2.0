'use client';
import { updateSubjects } from '@/reducers/data.slice';
import { getSubjectResponse } from '@/types/res/GetResponse.types';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const page = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		// Get All Subject List
		axios
			.get('/api/subjects')
			.then((response: AxiosResponse<getSubjectResponse[]>) => {
				dispatch(updateSubjects(response.data));
				window.localStorage.setItem('subjects', JSON.stringify(response.data));
			});
	}, []);

	return <div>page</div>;
};

export default page;
