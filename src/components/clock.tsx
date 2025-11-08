import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Maximize2, Minimize2, Calendar } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Interface for time details object
 * @interface TimeDetails
 */
interface TimeDetails {
	hours: number;
	minutes: number;
	seconds: number;
	date: string;
}

/**
 * Props for FlipDigit component
 * @interface FlipDigitProps
 */
interface FlipDigitProps {
	value: string;
	label?: string;
}

/**
 * Props for DateDisplay component
 * @interface DateDisplayProps
 */
interface DateDisplayProps {
	date: string;
}

/**
 * Props for AnalogClock component
 * @interface AnalogClockProps
 */
interface AnalogClockProps {
	hours: number;
	minutes: number;
	seconds: number;
	isDarkMode: boolean;
}

/**
 * Props for CalendarComponent
 * @interface CalendarComponentProps
 */
interface CalendarComponentProps {
	isDarkMode: boolean;
}

// ============================================================================
// FLIP DIGIT COMPONENT
// ============================================================================

/**
 * Displays a single flipping digit with smooth 3D animation
 * @component FlipDigit
 * @param {FlipDigitProps} props - Component props
 */
const FlipDigit: React.FC<FlipDigitProps> = ({ value, label }) => {
	const [currentValue, setCurrentValue] = useState<string>(value);
	const [isFlipping, setIsFlipping] = useState<boolean>(false);

	// * Effect: Handle digit flip animation when value changes
	useEffect(() => {
		if (value !== currentValue) {
			setIsFlipping(true);
			const timer: NodeJS.Timeout = setTimeout(() => {
				setCurrentValue(value);
				setIsFlipping(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [value, currentValue]);

	return (
		<div className='flex flex-col items-center'>
			<div className='relative w-16 h-20 perspective-1000'>
				<div className={`flip-card ${isFlipping ? 'flipping' : ''}`}>
					<div className='flip-card-inner'>
						{/* Front face of flip card */}
						<div className='flip-card-front'>
							<div className='bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-2xl border border-gray-700 h-full flex items-center justify-center'>
								<span className='text-4xl font-bold text-white font-mono'>
									{currentValue}
								</span>
							</div>
						</div>
						{/* Back face of flip card */}
						<div className='flip-card-back'>
							<div className='bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-2xl border border-gray-700 h-full flex items-center justify-center'>
								<span className='text-4xl font-bold text-white font-mono'>
									{value}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Optional label below digit */}
			{label && (
				<span className='text-xs opacity-75 mt-2 uppercase tracking-wider'>
					{label}
				</span>
			)}
		</div>
	);
};

// ============================================================================
// DATE DISPLAY COMPONENT
// ============================================================================

/**
 * Displays the date with sliding animation on change
 * @component DateDisplay
 * @param {DateDisplayProps} props - Component props
 */
const DateDisplay: React.FC<DateDisplayProps> = ({ date }) => {
	const [displayDate, setDisplayDate] = useState<string>(date);
	const [isChanging, setIsChanging] = useState<boolean>(false);

	// * Effect: Handle date change animation
	useEffect(() => {
		if (date !== displayDate) {
			setIsChanging(true);
			const timer: NodeJS.Timeout = setTimeout(() => {
				setDisplayDate(date);
				setIsChanging(false);
			}, 400);
			return () => clearTimeout(timer);
		}
	}, [date, displayDate]);

	return (
		<div className='relative overflow-hidden h-8'>
			<div className={`date-slide ${isChanging ? 'sliding' : ''}`}>
				<div className='bg-white/10 backdrop-blur-sm rounded-full px-6 py-1.5 border border-white/20 shadow-lg'>
					<span className='text-sm font-medium tracking-wide'>
						{displayDate}
					</span>
				</div>
			</div>
		</div>
	);
};

// ============================================================================
// ANALOG CLOCK COMPONENT
// ============================================================================

/**
 * Displays an animated analog clock with hour, minute, and second hands
 * @component AnalogClock
 * @param {AnalogClockProps} props - Component props
 */
const AnalogClock: React.FC<AnalogClockProps> = ({
	hours,
	minutes,
	seconds,
	isDarkMode,
}) => {
	// ! Calculate rotation angles for clock hands
	const secondAngle: number = seconds * 6 - 90; // 6 degrees per second
	const minuteAngle: number = minutes * 6 + seconds * 0.1 - 90; // 6 degrees per minute + smooth transition
	const hourAngle: number = (hours % 12) * 30 + minutes * 0.5 - 90; // 30 degrees per hour + smooth transition

	return (
		<div
			className={`relative w-64 h-64 rounded-full ${
				isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
			} border-4 shadow-2xl`}>
			{/* Clock center dot */}
			<div
				className={`absolute top-1/2 left-1/2 w-4 h-4 rounded-full ${
					isDarkMode ? 'bg-purple-400' : 'bg-purple-600'
				} transform -translate-x-1/2 -translate-y-1/2 z-10`}></div>

			{/* Hour markers */}
			{[...Array(12)].map((_: undefined, i: number) => {
				const angle: number = i * 30 - 90;
				const x: number = 50 + 40 * Math.cos((angle * Math.PI) / 180);
				const y: number = 50 + 40 * Math.sin((angle * Math.PI) / 180);
				return (
					<div
						key={i}
						className={`absolute w-2 h-2 rounded-full ${
							isDarkMode ? 'bg-gray-600' : 'bg-gray-400'
						}`}
						style={{
							left: `${x}%`,
							top: `${y}%`,
							transform: 'translate(-50%, -50%)',
						}}
					/>
				);
			})}

			{/* Hour hand */}
			<div
				className={`absolute top-1/2 left-1/2 origin-left ${
					isDarkMode ? 'bg-purple-400' : 'bg-purple-600'
				} rounded-full transition-transform duration-1000`}
				style={{
					width: '60px',
					height: '6px',
					transform: `translateY(-50%) rotate(${hourAngle}deg)`,
				}}
			/>

			{/* Minute hand */}
			<div
				className={`absolute top-1/2 left-1/2 origin-left ${
					isDarkMode ? 'bg-pink-400' : 'bg-pink-600'
				} rounded-full transition-transform duration-1000`}
				style={{
					width: '80px',
					height: '4px',
					transform: `translateY(-50%) rotate(${minuteAngle}deg)`,
				}}
			/>

			{/* Second hand */}
			<div
				className={`absolute top-1/2 left-1/2 origin-left ${
					isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'
				} rounded-full transition-transform duration-200`}
				style={{
					width: '90px',
					height: '2px',
					transform: `translateY(-50%) rotate(${secondAngle}deg)`,
				}}
			/>
		</div>
	);
};

// ============================================================================
// CALENDAR COMPONENT
// ============================================================================

/**
 * Displays a fully functional calendar for the current month
 * @component CalendarComponent
 * @param {CalendarComponentProps} props - Component props
 */
const CalendarComponent: React.FC<CalendarComponentProps> = ({
	isDarkMode,
}) => {
	const [currentDate] = useState<Date>(new Date());

	// * Get calendar data
	const year: number = currentDate.getFullYear();
	const month: number = currentDate.getMonth();
	const today: number = currentDate.getDate();

	const firstDay: number = new Date(year, month, 1).getDay();
	const daysInMonth: number = new Date(year, month + 1, 0).getDate();
	const monthName: string = currentDate.toLocaleDateString('en-US', {
		month: 'long',
	});

	const days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// ! Generate calendar days array
	const calendarDays: (number | null)[] = [];

	// Add empty cells for days before the first day of the month
	for (let i = 0; i < firstDay; i++) {
		calendarDays.push(null);
	}

	// Add days of the month
	for (let day = 1; day <= daysInMonth; day++) {
		calendarDays.push(day);
	}

	return (
		<div
			className={`${
				isDarkMode
					? 'bg-gray-800 border-gray-700 text-white'
					: 'bg-white border-gray-300 text-gray-900'
			} rounded-xl border-2 p-6 shadow-2xl w-80`}>
			{/* Calendar header */}
			<div className='flex items-center justify-between mb-4'>
				<Calendar className='h-5 w-5' />
				<h3 className='text-lg font-bold'>
					{monthName} {year}
				</h3>
				<div className='w-5' /> {/* Spacer for alignment */}
			</div>

			{/* Day names */}
			<div className='grid grid-cols-7 gap-2 mb-2'>
				{days.map((day: string) => (
					<div
						key={day}
						className='text-center text-xs font-semibold opacity-60'>
						{day}
					</div>
				))}
			</div>

			{/* Calendar grid */}
			<div className='grid grid-cols-7 gap-2'>
				{calendarDays.map((day: number | null, index: number) => (
					<div
						key={index}
						className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
							day === today
								? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold'
								: day
								? isDarkMode
									? 'hover:bg-gray-700 cursor-pointer'
									: 'hover:bg-gray-100 cursor-pointer'
								: ''
						}`}>
						{day}
					</div>
				))}
			</div>
		</div>
	);
};

// ============================================================================
// FULLSCREEN VIEW COMPONENT
// ============================================================================

/**
 * Fullscreen view with analog clock, digital time, and calendar
 * @component FullscreenView
 * @param {object} props - Component props
 */
const FullscreenView: React.FC<{
	currentTimeDetails: TimeDetails;
	isDarkMode: boolean;
	onClose: () => void;
}> = ({ currentTimeDetails, isDarkMode, onClose }) => {
	const hours: string = String(currentTimeDetails.hours).padStart(2, '0');
	const minutes: string = String(currentTimeDetails.minutes).padStart(2, '0');
	const seconds: string = String(currentTimeDetails.seconds).padStart(2, '0');

	return (
		<div
			className={`fixed inset-0 z-50 ${
				isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
			} overflow-hidden flex items-center justify-center`}>
			{/* Close button */}
			<button
				onClick={onClose}
				className={`absolute top-6 right-6 p-3 rounded-full ${
					isDarkMode
						? 'bg-gray-800 hover:bg-gray-700 text-white'
						: 'bg-white hover:bg-gray-100 text-gray-900'
				} shadow-lg transition-all hover:scale-110`}
				aria-label='Exit fullscreen'>
				<Minimize2 className='h-6 w-6' />
			</button>

			{/* Main content */}
			<div className='flex flex-col items-center justify-center gap-8 p-8 max-h-screen'>
				{/* Analog Clock */}
				<div className='flex flex-col items-center gap-4 scale-90'>
					<AnalogClock
						hours={currentTimeDetails.hours}
						minutes={currentTimeDetails.minutes}
						seconds={currentTimeDetails.seconds}
						isDarkMode={isDarkMode}
					/>

					{/* Digital Time Display */}
					<div className='flex items-center gap-3'>
						<FlipDigit value={hours[0]} />
						<FlipDigit value={hours[1]} />
						<div className='text-5xl font-bold animate-pulse mx-1 text-purple-500'>
							:
						</div>
						<FlipDigit value={minutes[0]} />
						<FlipDigit value={minutes[1]} />
						<div className='text-5xl font-bold animate-pulse mx-1 text-purple-500'>
							:
						</div>
						<FlipDigit value={seconds[0]} />
						<FlipDigit value={seconds[1]} />
					</div>

					{/* Date */}
					<div
						className={`text-xl font-medium ${
							isDarkMode ? 'text-gray-300' : 'text-gray-700'
						}`}>
						{currentTimeDetails.date}
					</div>
				</div>

				{/* Calendar */}
				<CalendarComponent isDarkMode={isDarkMode} />
			</div>
		</div>
	);
};

// ============================================================================
// MAIN FLIP CLOCK CARD COMPONENT
// ============================================================================

/**
 * Main component that displays a flip clock with fullscreen capability
 * @component FlipClockCard
 * @example
 * ```tsx
 * import FlipClockCard from './FlipClockCard';
 *
 * function App() {
 *   return <FlipClockCard />;
 * }
 * ```
 */
const FlipClockCard: React.FC = () => {
	// * State: Time details
	const [currentTimeDetails, setCurrentTimeDetails] = useState<TimeDetails>({
		hours: 0,
		minutes: 0,
		seconds: 0,
		date: new Date().toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}),
	});

	// * State: Fullscreen mode
	const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

	// * State: Dark mode detection
	const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

	// * Effect: Detect system dark mode preference
	useEffect(() => {
		const darkModeQuery: MediaQueryList = window.matchMedia(
			'(prefers-color-scheme: dark)',
		);
		setIsDarkMode(darkModeQuery.matches);

		const handler = (e: MediaQueryListEvent): void => setIsDarkMode(e.matches);
		darkModeQuery.addEventListener('change', handler);

		return () => darkModeQuery.removeEventListener('change', handler);
	}, []);

	// * Effect: Update time every second
	useEffect(() => {
		const updateTime = (): void => {
			const now: Date = new Date();
			setCurrentTimeDetails({
				hours: now.getHours(),
				minutes: now.getMinutes(),
				seconds: now.getSeconds(),
				date: now.toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				}),
			});
		};

		updateTime();
		const interval: NodeJS.Timeout = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, []);

	// * Handler: Enter browser fullscreen mode
	const enterBrowserFullscreen = useCallback((): void => {
		if (document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen().catch((err) => {
				console.log('Fullscreen request failed:', err);
			});
		}
	}, []);

	// * Handler: Exit browser fullscreen mode
	const exitBrowserFullscreen = useCallback((): void => {
		if (document.exitFullscreen && document.fullscreenElement) {
			document.exitFullscreen();
		}
	}, []);

	// * Handler: Toggle fullscreen mode
	const toggleFullscreen = useCallback((): void => {
		setIsFullscreen((prev) => {
			if (!prev) {
				enterBrowserFullscreen();
			} else {
				exitBrowserFullscreen();
			}
			return !prev;
		});
	}, [enterBrowserFullscreen, exitBrowserFullscreen]);

	const hours: string = String(currentTimeDetails.hours).padStart(2, '0');
	const minutes: string = String(currentTimeDetails.minutes).padStart(2, '0');
	const seconds: string = String(currentTimeDetails.seconds).padStart(2, '0');

	return (
		<>
			{/* CSS Styles */}
			<style>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flipping .flip-card-inner {
          animation: flip 0.6s ease-in-out;
        }

        @keyframes flip {
          0% {
            transform: rotateX(0deg);
          }
          50% {
            transform: rotateX(-90deg);
          }
          100% {
            transform: rotateX(-180deg);
          }
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
        }

        .flip-card-back {
          transform: rotateX(180deg);
        }

        .date-slide {
          transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
        }

        .date-slide.sliding {
          animation: slideDate 0.8s ease-in-out;
        }

        @keyframes slideDate {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          51% {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .glow-effect {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.4),
                      0 0 40px rgba(168, 85, 247, 0.2),
                      0 0 60px rgba(168, 85, 247, 0.1);
        }
      `}</style>

			{/* Fullscreen view */}
			{isFullscreen && (
				<FullscreenView
					currentTimeDetails={currentTimeDetails}
					isDarkMode={isDarkMode}
					onClose={toggleFullscreen}
				/>
			)}

			{/* Compact clock card */}
			<div className='relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-lg rounded-lg overflow-hidden glow-effect'>
				{/* Fullscreen button */}
				<button
					onClick={toggleFullscreen}
					className='absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110 z-10'
					aria-label='Enter fullscreen'>
					<Maximize2 className='h-4 w-4' />
				</button>

				{/* Card header */}
				<div className='pb-3 pt-6 px-6'>
					<h3 className='flex items-center gap-2 text-lg font-semibold'>
						<Clock className='h-5 w-5' />
						Current Time
					</h3>
				</div>

				{/* Card content */}
				<div className='space-y-6 px-6 pb-6'>
					<div className='text-center'>
						<div className='flex items-center justify-center gap-3'>
							<FlipDigit value={hours[0]} />
							<FlipDigit value={hours[1]} />

							<div className='text-5xl font-bold animate-pulse mx-1'>:</div>

							<FlipDigit value={minutes[0]} />
							<FlipDigit value={minutes[1]} />

							<div className='text-5xl font-bold animate-pulse mx-1'>:</div>

							<FlipDigit value={seconds[0]} />
							<FlipDigit value={seconds[1]} />
						</div>

						<div className='mt-6 flex justify-center'>
							<DateDisplay date={currentTimeDetails.date} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default FlipClockCard;
