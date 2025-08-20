import PomodoroTimer from '@/components/Pomodoro-timer';
import React from 'react';

const page = () => {
	return (
		<section className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-100 to-rose-200 dark:from-orange-950 dark:via-red-800 dark:to-red-900 p-4 md:p-6 flex items-center justify-center">
			<PomodoroTimer size='lg' />
		</section>
	);
};

export default page;
