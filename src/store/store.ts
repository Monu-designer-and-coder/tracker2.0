import { configureStore } from '@reduxjs/toolkit';
import dataReducers from '@/reducers/data.slice';

export const store = configureStore({
	reducer: { data: dataReducers },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
