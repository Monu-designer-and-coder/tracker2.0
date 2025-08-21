const DaysOfWeek = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
];

export interface getSubjectResponse {
	_id: string;
	name: string;
	standard: string;
}
export interface getChapterResponse {
	_id: string;
	name: string;
	subject: getSubjectResponse;
	seqNumber: number;
	done: boolean;
	selectionDiary: boolean;
	onePager: Boolean;
	DPP: Boolean;
	Module: Boolean;
	PYQ: Boolean;
	ExtraMaterial: Boolean;
}

export interface getSubjectWiseChapterResponse extends getSubjectResponse {
	chapterList: {
		_id: string;
		name: string;
		seqNumber: number;
		done: boolean;
		selectionDiary: boolean;
		onePager: boolean;
		DPP: boolean;
		Module: boolean;
		PYQ: boolean;
		ExtraMaterial: boolean;
	}[];
}

export interface getTaskCategoryResponse {
	category: string;
	_id: string;
}
export interface getTaskResponse {
	_id: string;
	task: string;
	category: string;
	done?: boolean;
	assignedDate?: Date;
	completedAt?: Date;
	repeat?: (typeof DaysOfWeek)[number][];
}

// ! API Response Types
// ? This file defines the response interfaces for various API endpoints.

// * Common structure for daily/all-time task tracker responses
export interface getTaskTrackerResponse {
	_id: string; // The date string (e.g., "2025-08-21")
	taskDetails?: {
		_id: string;
		category: string;
		task: string;
		done: boolean;
		assignedDate: string;
	}[];
	totalTaskAssigned: number;
	totalTaskDone: number;
	points: number;
}

// * Defines the structure for a single day's breakdown within a weekly report
export interface WeeklyDayBreakdown {
    day: string; // The date string (e.g., "2025-08-21")
    dayName: string; // The name of the day (e.g., "Thursday")
    taskDetails: {
        _id: string;
        category: string;
        task: string;
        done: boolean;
        assignedDate: string;
    }[];
    totalTaskAssigned: number;
    totalTaskDone: number;
    points: number;
}

// * Defines the structure for the weekly task tracker response
export interface getWeeklyTaskTrackerResponse {
    _id: {
        week: number;
        year: number;
    };
    weeklyBreakdown: WeeklyDayBreakdown[];
    totalTasksAssignedWeekly: number;
    totalTasksDoneWeekly: number;
    weeklyPoints: number;
}
