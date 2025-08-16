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
export interface getTaskTrackerResponse {
	_id: string;
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
