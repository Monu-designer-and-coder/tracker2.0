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
		onePager: Boolean;
		DPP: Boolean;
		Module: Boolean;
		PYQ: Boolean;
		ExtraMaterial: Boolean;
	}[];
}
