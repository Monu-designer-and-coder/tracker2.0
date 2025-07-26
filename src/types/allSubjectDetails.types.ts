export interface allSubjectDetails {
	_id: string;
	standard: string;
	name: string;
	chapters: {
		_id: string;
		name: string;
		seqNumber: number;
		done: boolean;
		selectionDiary: boolean;
		topics?: {
			_id: string;
			name: string;
		}[];
	}[];
}
