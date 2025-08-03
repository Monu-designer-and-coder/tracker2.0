import {
	getSubjectResponse,
	getSubjectWiseChapterResponse,
} from '@/types/res/GetResponse.types';
import { createSlice } from '@reduxjs/toolkit';

const initialState: {
	subjects: getSubjectResponse[];
	subjectWiseChapters: getSubjectWiseChapterResponse[];
} = {
	subjects: [
		{
			_id: '68829bd9d026024a9d64871f',
			name: 'LOADING...',
			standard: 'LOADING...',
		},
	],
	subjectWiseChapters: [
		{
			_id: '68829bd9d026024a9d64871f',
			name: 'LOADING...',
			standard: 'LOADING...',
			chapterList: [
				{
					_id: '68892d87cfa0c84bcaf90961',
					name: 'LOADING...',
					seqNumber: 0,
					done: true,
					selectionDiary: true,
					DPP: false,
					ExtraMaterial: false,
					Module: false,
					PYQ: false,
					onePager: false,
				},
			],
		},
	],
};

export const dataSlice = createSlice({
	name: 'data',
	initialState,
	reducers: {
		updateSubjects: (state, actions) => {
			const data: getSubjectResponse[] = actions.payload;
			state.subjects = data;
		},
		updateSubjectWiseChapters: (state, actions) => {
			const data: getSubjectWiseChapterResponse[] = actions.payload;
			state.subjectWiseChapters = data;
		},
	},
});

export const { updateSubjects, updateSubjectWiseChapters } = dataSlice.actions;
export default dataSlice.reducer;
