'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const DarkModeSwitch = () => {
	const { setTheme, systemTheme, theme } = useTheme();
	const [darkMode, setDarkMode] = useState<boolean>(false);
	useEffect(() => {
		setDarkMode(systemTheme === 'dark');
	}, []);
	useEffect(() => {
		setTheme(darkMode ? 'dark' : 'light');
	}, [darkMode]);
	return (
		<div className='flex items-center space-x-2  '>
			<Label htmlFor='dark-mode' className='text-zinc-950 dark:text-zinc-300'>
				Light Mode
				<Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 ease-in-out duration-100 ' />
			</Label>
			<Switch
				id='dark-mode'
				checked={darkMode}
				onCheckedChange={(e) => {
					setDarkMode(e);
				}}
			/>
			<Label htmlFor='dark-mode' className='text-zinc-950 dark:text-zinc-300'>
				Dark Mode
				<Moon className=' transition-all ease-in-out duration-100 h-[1.2rem] w-[1.2rem] rotate-0 scale-100  dark:-rotate-90' />
			</Label>
		</div>
	);
};

export default DarkModeSwitch;
