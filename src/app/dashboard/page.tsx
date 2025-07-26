'use client';

import { ExpandableCard } from '@/components/ui/expandable-card';
import { getSubjectResponse } from '@/types/res/GetResponse.types';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';

const page = () => {
	const [subjectList, setSubjectLIst] = useState<getSubjectResponse[]>();

	useEffect(() => {
		// Get All Subject List
		axios
			.get('/api/subjects')
			.then((response: AxiosResponse<getSubjectResponse[]>) =>
				setSubjectLIst(response.data),
			);
	}, []);

	return (
		<div>
			{subjectList?.map((e) => (
				<p key={e._id}>{e.name}</p>
			))}
			<ExpandableCard />
		</div>
	);
};

export default page;
