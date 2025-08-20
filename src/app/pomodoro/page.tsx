import PomodoroTimer from '@/components/Pomodoro-timer';
import React from 'react';

const page = () => {
	return (
		<section className='w-full h-full flex items-center justify-center'>
			<PomodoroTimer size='lg' />
		</section>
	);
};

export default page;
