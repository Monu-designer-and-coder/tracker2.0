export interface ChapterData {
	_id: string;
	name: string;
	seqNumber: number;
	done: boolean;
	selectionDiary: boolean;
	topics?: topicData[];
	completedTopics?: topicData[];
	totalTopics?: number;
	totalCompletedTopics?: number;
	percentCompleted?: number;
	subject?: string;
}
export interface topicData {
	_id: string;
	name: string;
	seqNumber: number;
	done: boolean;
}

export interface subjectData {
	_id: string;
	name: string;
	standard: string;
	chapters: ChapterData[];
	completedChapters: ChapterData[];
	completedSelectionDiaryChapters: ChapterData[];
	totalChapters: number;
	totalCompletedChapters: number;
	totalCompletedSelectionDiaryChapters: number;
	prevChapter: ChapterData;
	currChapter: ChapterData;
	percentCompleted: number;
	percentSelectionDiaryCompleted: number;
	currChapterTopics: topicData[];
}
