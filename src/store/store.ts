import { configureStore } from '@reduxjs/toolkit';
import dataReducers from '@/reducers/data.slice';

export const store = configureStore({
	reducer: dataReducers,
});
