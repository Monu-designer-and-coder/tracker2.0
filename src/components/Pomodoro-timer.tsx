// components/PomodoroTimer.tsx
'use client'; // * This directive marks the component as a Client Component in Next.js.
// It allows us to use React Hooks like useState, useEffect, etc., in this file.

import React, { useState, useEffect, useRef, useCallback } from 'react';
// ? Importing 'cn' utility: This function helps conditionally combine and merge Tailwind CSS classes.
// ! If you don't have this utility configured (e.g., in '@/lib/utils'), you might need to create it.
// * It typically combines 'clsx' and 'tailwind-merge'.
import { cn } from '@/lib/utils'; // TODO: Adjust this path based on your project's actual structure.

// * Importing Shadcn UI components: Button, Input, and Card.
// ! Ensure these components are installed and configured in your project using 'npx shadcn-ui@latest add <component_name>'.
// - If not installed, you would need to replace them with standard HTML elements (<button>, <input>, <div>).
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// * Interface for PomodoroTimer component props.
// ? This helps in type-checking the props passed to the component, making it more robust.
interface PomodoroTimerProps {
	initialPomodoroDuration?: number; // * Default Pomodoro session duration in minutes.
	initialShortBreakDuration?: number; // * Default Short Break duration in minutes.
	initialLongBreakDuration?: number; // * Default Long Break duration in minutes.
	size?: 'sm' | 'md' | 'lg' | 'custom'; // * Predefined sizes or 'custom' for manual sizing.
	customSize?: string; // * Tailwind CSS classes for custom width and height (e.g., "w-72 h-72").
}

// * Main Pomodoro Timer functional component.
const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
	initialPomodoroDuration = 45,
	initialShortBreakDuration = 5,
	initialLongBreakDuration = 15,
	size = 'md',
	customSize = 'w-64 h-64',
}) => {
	// * State for managing the durations of each mode.
	// ? These can be customized via props or the UI inputs.
	const [pomodoroDuration, setPomodoroDuration] = useState<number>(
		initialPomodoroDuration,
	);
	const [shortBreakDuration, setShortBreakDuration] = useState<number>(
		initialShortBreakDuration,
	);
	const [longBreakDuration, setLongBreakDuration] = useState<number>(
		initialLongBreakDuration,
	);

	// * State for the remaining time displayed on the timer.
	const [timeLeft, setTimeLeft] = useState<{
		minutes: number;
		seconds: number;
	}>({
		minutes: initialPomodoroDuration,
		seconds: 0,
	});
	const [timeLeftPercent, setTimeLeftPercent] = useState<number>(100);
	const [initialTime, setInitialTime] = useState<number>(100);
	// * State to control if the timer is currently active (running).
	const [isActive, setIsActive] = useState<boolean>(false);
	// * State to track the current mode of the timer ('pomodoro', 'shortBreak', 'longBreak').
	const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>(
		'pomodoro',
	);
	// * useRef to store the interval ID.
	// ? This allows us to clear the interval when the component unmounts or the timer stops.
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// * useCallback hook for a memoized function to get the duration for the current mode.
	// ? This prevents unnecessary re-creations of the function on re-renders, optimizing performance.
	const getDurationForMode = useCallback(
		(currentMode: 'pomodoro' | 'shortBreak' | 'longBreak'): number => {
			switch (currentMode) {
				case 'pomodoro':
					return pomodoroDuration;
				case 'shortBreak':
					return shortBreakDuration;
				case 'longBreak':
					return longBreakDuration;
				default:
					return initialPomodoroDuration; // ! Fallback to initial pomodoro duration.
			}
		},
		[pomodoroDuration, shortBreakDuration, longBreakDuration],
	);

	useEffect(() => {
		const totalSecondsLeft = timeLeft.minutes * 60 + timeLeft.seconds;
		const initialSeconds = initialTime * 60;
		const value = (totalSecondsLeft * 100) / initialSeconds;
		setTimeLeftPercent(Math.round(100 - value));
	}, [timeLeft, initialTime]);

	// * useCallback hook for a memoized function to reset the timer.
	// ? It sets isActive to false, clears any running interval, and resets timeLeft based on the current mode.
	const resetTimer = useCallback(() => {
		setIsActive(false); // Stop the timer.
		const duration = getDurationForMode(mode); // Get the correct duration for the current mode.
		setTimeLeft({ minutes: duration, seconds: 0 }); // Reset time.
		setInitialTime(duration);
		if (intervalRef.current) {
			clearInterval(intervalRef.current); // Clear any existing interval.
		}
	}, [mode, getDurationForMode]);

	// * useEffect hook to handle mode changes and initial timer setup.
	// ? This ensures that when the 'mode' state changes (e.g., from Pomodoro to Short Break),
	// ? the timer automatically resets to the correct duration for that new mode.
	useEffect(() => {
		resetTimer(); // * Reset timer whenever the mode changes or on initial component mount.
	}, [mode, resetTimer]); // * Dependencies: 'mode' and 'resetTimer' (which is useCallback memoized).

	// * Main timer logic using useEffect.
	// ? This effect runs whenever 'isActive' or 'mode' changes.
	// ! It sets up a setInterval when 'isActive' is true and clears it otherwise.
	useEffect(() => {
		if (isActive) {
			// * Start the countdown interval.
			intervalRef.current = setInterval(() => {
				setTimeLeft((prevTime) => {
					// * Check if the timer has reached zero.
					if (prevTime.minutes === 0 && prevTime.seconds === 0) {
						clearInterval(intervalRef.current!); // ! Clear the interval once timer finishes.
						setIsActive(false); // Set timer to inactive.

						// * Logic to cycle through modes after a timer finishes.
						let nextMode: 'pomodoro' | 'shortBreak' | 'longBreak';
						if (mode === 'pomodoro') {
							nextMode = 'shortBreak'; // * After Pomodoro, go to Short Break.
						} else if (mode === 'shortBreak') {
							nextMode = 'longBreak'; // * After Short Break, go to Long Break (simplified cycle).
						} else {
							nextMode = 'pomodoro'; // * After Long Break, go back to Pomodoro.
						}
						setMode(nextMode); // Set the next mode.
						// TODO: Consider adding a sound notification or a pop-up here when timer finishes.
						return { minutes: 0, seconds: 0 }; // * Temporarily set to 0 to trigger mode change correctly.
					}

					// * Decrement seconds. If seconds reach 0, decrement minutes and reset seconds to 59.
					if (prevTime.seconds === 0) {
						return { minutes: prevTime.minutes - 1, seconds: 59 };
					} else {
						return { ...prevTime, seconds: prevTime.seconds - 1 };
					}
				});
			}, 1000); // * Update every second (1000 milliseconds).
		} else {
			// * If timer is not active, ensure the interval is cleared.
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		}

		// * Cleanup function: This runs when the component unmounts or when dependencies change (and the effect re-runs).
		// ? It ensures that no lingering intervals cause memory leaks.
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isActive, mode]); // * Dependencies: 'isActive' (to start/stop) and 'mode' (to respond to mode changes).

	// * Handler for the Start/Pause button.
	const handleStartPause = (): void => {
		// ? If the timer is at zero, reset it to the current mode's duration before starting.
		if (timeLeft.minutes === 0 && timeLeft.seconds === 0) {
			const duration = getDurationForMode(mode);
			setTimeLeft({ minutes: duration, seconds: 0 });
			setInitialTime(duration);
		}
		setIsActive(!isActive); // * Toggle the active state (start if paused, pause if active).
	};

	// * Handlers for updating duration inputs.
	// ? These ensure only valid positive numbers are set as durations.
	const handlePomodoroDurationChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	): void => {
		const value = parseInt(e.target.value, 10);
		if (!isNaN(value) && value > 0) {
			setPomodoroDuration(value);
			// * If currently in Pomodoro mode, update the displayed time and pause.
			if (mode === 'pomodoro') {
				setTimeLeft({ minutes: value, seconds: 0 });
				setInitialTime(value);
				setIsActive(false);
			}
		}
	};

	const handleShortBreakDurationChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	): void => {
		const value = parseInt(e.target.value, 10);
		if (!isNaN(value) && value > 0) {
			setShortBreakDuration(value);
			// * If currently in Short Break mode, update the displayed time and pause.
			if (mode === 'shortBreak') {
				setTimeLeft({ minutes: value, seconds: 0 });
				setInitialTime(value);
				setIsActive(false);
			}
		}
	};

	const handleLongBreakDurationChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	): void => {
		const value = parseInt(e.target.value, 10);
		if (!isNaN(value) && value > 0) {
			setLongBreakDuration(value);
			// * If currently in Long Break mode, update the displayed time and pause.
			if (mode === 'longBreak') {
				setTimeLeft({ minutes: value, seconds: 0 });
				setInitialTime(value);
				setIsActive(false);
			}
		}
	};

	// * Object mapping predefined sizes to Tailwind CSS classes for the timer display.
	const timerSizeClasses: { [key: string]: string } = {
		sm: 'w-48 h-48 text-5xl', // Small size: 48 units width/height, 5xl font.
		md: 'w-64 h-64 text-7xl', // Medium size: 64 units width/height, 7xl font.
		lg: 'w-80 h-80 text-8xl', // Large size: 80 units width/height, 8xl font.
		custom: customSize, // Custom size determined by the 'customSize' prop.
	};

	// * Determine the current size class to apply.
	const currentSizeClass = timerSizeClasses[size] || timerSizeClasses.md; // ! Fallback to 'md' if size prop is invalid.

	return (
		// * Main container Card component from Shadcn UI.
		// ? Uses 'cn' for conditional Tailwind classes, supporting dark mode.
		<Card
			className={cn(
				'flex flex-col items-center justify-center p-6 rounded-3xl', // * Layout and padding.
				'bg-pink-100 dark:bg-zinc-900 shadow-xl', // * Background colors for light and dark mode, with shadow.
				'text-rose-900 dark:text-rose-100', // * Text colors for light and dark mode.
				'max-w-md mx-auto', // * Constrains width and centers the component horizontally.
			)}>
			{/* Timer Display Circle */}
			<div
				className={cn(
					'relative flex items-center justify-center rounded-full border-4', // * Circular shape, centered content, border.
					'border-red-700', // * Border colors for light and dark mode.
					`bg-gradient-to-b from-red-700 to-red-200 from-[${timeLeftPercent}%] to-[${timeLeftPercent}%] `, // * Inner background of the circle for light and dark mode.
					currentSizeClass, // * Applies the dynamically determined size (w-X h-X text-Yxl).
					'transition-all duration-300 ease-in-out', // * Smooth transitions for size changes.
				)}>
				<span
					className={cn(
						'font-mono font-bold', // * Monospace font for digits, bold text.
						'text-rose-400', // * Text color for the time display.
					)}>
					{String(timeLeft.minutes).padStart(2, '0')}:
					{String(timeLeft.seconds).padStart(2, '0')}
				</span>
			</div>

			{/* Mode Selection Buttons */}
			<div className='flex gap-2 mt-6 mb-4'>
				{/* Pomodoro Mode Button */}
				<Button
					onClick={() => setMode('pomodoro')}
					className={cn(
						'px-4 py-2 rounded-lg text-sm font-medium transition-colors', // * Button styling.
						mode === 'pomodoro'
							? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600' // * Active (selected) state.
							: 'bg-rose-200 hover:bg-rose-300 text-rose-800 dark:bg-rose-800 dark:hover:bg-rose-700 dark:text-rose-100', // * Inactive state.
					)}>
					Pomodoro
				</Button>
				{/* Short Break Mode Button */}
				<Button
					onClick={() => setMode('shortBreak')}
					className={cn(
						'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
						mode === 'shortBreak'
							? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600'
							: 'bg-rose-200 hover:bg-rose-300 text-rose-800 dark:bg-rose-800 dark:hover:bg-rose-700 dark:text-rose-100',
					)}>
					Short Break
				</Button>
				{/* Long Break Mode Button */}
				<Button
					onClick={() => setMode('longBreak')}
					className={cn(
						'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
						mode === 'longBreak'
							? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600'
							: 'bg-rose-200 hover:bg-rose-300 text-rose-800 dark:bg-rose-800 dark:hover:bg-rose-700 dark:text-rose-100',
					)}>
					Long Break
				</Button>
			</div>

			{/* Control Buttons: Start/Pause and Reset */}
			<div className='flex gap-4 mt-2'>
				{/* Start/Pause Button */}
				<Button
					onClick={handleStartPause}
					className={cn(
						'px-6 py-3 rounded-xl font-semibold', // * Button padding, rounded corners, font weight.
						isActive
							? 'bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-700 dark:hover:bg-rose-600' // * Pause state color.
							: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600', // * Start state color.
					)}>
					{isActive ? 'Pause' : 'Start'}
				</Button>
				{/* Reset Button */}
				<Button
					onClick={resetTimer}
					className={cn(
						'px-6 py-3 rounded-xl font-semibold',
						'bg-rose-400 hover:bg-rose-500 text-white dark:bg-rose-600 dark:hover:bg-rose-500', // * Reset button colors.
					)}>
					Reset
				</Button>
			</div>

			{/* Customizable Duration Inputs */}
			<div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full'>
				{/* Pomodoro Duration Input */}
				<div className='flex flex-col items-center'>
					<label
						htmlFor='pomodoro-duration'
						className='text-sm font-medium mb-1 text-rose-700 dark:text-rose-300' // * Label styling.
					>
						Pomodoro (min)
					</label>
					<Input
						id='pomodoro-duration'
						type='number'
						value={pomodoroDuration}
						onChange={handlePomodoroDurationChange}
						min='1' // ! Minimum value is 1 minute.
						className={cn(
							'w-24 text-center bg-rose-100 dark:bg-rose-900', // * Input background for light and dark mode.
							'border-rose-300 dark:border-rose-700', // * Input border colors.
							'text-rose-800 dark:text-rose-200', // * Input text colors.
						)}
					/>
				</div>
				{/* Short Break Duration Input */}
				<div className='flex flex-col items-center'>
					<label
						htmlFor='short-break-duration'
						className='text-sm font-medium mb-1 text-rose-700 dark:text-rose-300'>
						Short Break (min)
					</label>
					<Input
						id='short-break-duration'
						type='number'
						value={shortBreakDuration}
						onChange={handleShortBreakDurationChange}
						min='1'
						className={cn(
							'w-24 text-center bg-rose-100 dark:bg-rose-900',
							'border-rose-300 dark:border-rose-700',
							'text-rose-800 dark:text-rose-200',
						)}
					/>
				</div>
				{/* Long Break Duration Input */}
				<div className='flex flex-col items-center'>
					<label
						htmlFor='long-break-duration'
						className='text-sm font-medium mb-1 text-rose-700 dark:text-rose-300'>
						Long Break (min)
					</label>
					<Input
						id='long-break-duration'
						type='number'
						value={longBreakDuration}
						onChange={handleLongBreakDurationChange}
						min='1'
						className={cn(
							'w-24 text-center bg-rose-100 dark:bg-rose-900',
							'border-rose-300 dark:border-rose-700',
							'text-rose-800 dark:text-rose-200',
						)}
					/>
				</div>
			</div>
		</Card>
	);
};

export default PomodoroTimer;
