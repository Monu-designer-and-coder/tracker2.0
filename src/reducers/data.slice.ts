import { getSubjectResponse } from '@/types/res/GetResponse.types';
import { createSlice } from '@reduxjs/toolkit';

const initialState: {
	subjects: getSubjectResponse[];
} = {
	subjects: [
		{
			_id: '68829bd9d026024a9d64871f',
			name: 'LOADING...',
			standard: 'LOADING...',
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
	},
});

export const { updateSubjects } = dataSlice.actions;
export default dataSlice.reducer;
