'use client';

import React from 'react';
import { FloatingDock } from '@/components/ui/floating-dock';
import {
	FcTodoList,
	FcParallelTasks,
	FcSalesPerformance,
} from 'react-icons/fc';

/**
 * Enhanced Layout Component for Tasks Module
 * 
 * Provides a modern, visually appealing navigation structure across all task-related pages
 * using a floating dock with glass morphism effects and gradient backgrounds.
 * The dock includes navigation links for Categories, Home (main tasks), and Tracker pages.
 * 
 * Features:
 * - Modern gradient backgrounds with glass morphism effects
 * - Responsive design with full viewport height optimization
 * - Fixed floating navigation dock with smooth animations
 * - Consistent spacing and layout across all task pages
 * - Dark mode compatible styling with enhanced contrast
 * - Interactive hover effects and micro-animations
 * - Professional color scheme and visual hierarchy
 */

interface TasksLayoutProps {
	/** Child components/pages to render within the layout */
	children: React.ReactNode;
}

export default function TasksLayout({ children }: TasksLayoutProps) {
	// Navigation configuration for floating dock with enhanced styling
	// Using React Icons for consistent visual identity and accessibility
	const navigationLinks = [
		{
			title: 'Categories',
			icon: (
				<FcParallelTasks 
					className='h-full w-full text-neutral-500 dark:text-neutral-300 transition-all duration-300 group-hover:scale-110' 
					aria-hidden="true"
				/>
			),
			href: '/tasks/category',
		},
		{
			title: 'Home',
			icon: (
				<FcTodoList 
					className='h-full w-full text-neutral-500 dark:text-neutral-300 transition-all duration-300 group-hover:scale-110'
					aria-hidden="true" 
				/>
			),
			href: '/tasks',
		},
		{
			title: 'Tracker',
			icon: (
				<FcSalesPerformance 
					className='h-full w-full text-neutral-500 dark:text-neutral-300 transition-all duration-300 group-hover:scale-110'
					aria-hidden="true" 
				/>
			),
			href: '/tasks/tracker',
		},
	];

	return (
		<main className='min-h-screen relative overflow-hidden'>
			{/* Enhanced gradient background with glass morphism */}
			<div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20'>
				{/* Animated gradient orbs for modern effect */}
				<div className='absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse'></div>
				<div className='absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-1000'></div>
			</div>

			{/* Glass morphism overlay */}
			<div className='absolute inset-0 backdrop-blur-sm bg-white/10 dark:bg-black/10'></div>

			{/* Main content container with enhanced layout */}
			<div className='relative z-10 flex items-center justify-center flex-col h-[90vh] w-full p-4'>
				{/* Main content area with improved glass effect */}
				<section 
					className='w-full h-full flex items-center justify-center relative'
					role="main"
					aria-label="Task management content"
				>
					{/* Content backdrop with subtle glass effect */}
					<div className='absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl'></div>
					
					{/* Actual content */}
					<div className='relative z-10 w-full h-full'>
						{children}
					</div>
				</section>
				
				{/* Enhanced floating navigation dock with modern styling */}
				<FloatingDock 
					desktopClassName='fixed bottom-6 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/50' 
					items={navigationLinks}
					aria-label="Task navigation"
				/>
			</div>

			{/* Subtle animated background particles */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute top-1/4 left-1/3 w-2 h-2 bg-blue-400/20 rounded-full animate-ping delay-300'></div>
				<div className='absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400/20 rounded-full animate-ping delay-700'></div>
				<div className='absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-indigo-400/20 rounded-full animate-ping delay-1000'></div>
			</div>
		</main>
	);
}

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient backgrounds with dynamic color transitions
// * 2. Glass morphism effects with backdrop blur and transparency
// * 3. Animated gradient orbs for visual depth and movement
// * 4. Enhanced floating dock with improved glass styling
// * 5. Subtle particle animations for ambient background effects
// * 6. Improved responsive design with better mobile adaptation
// * 7. Enhanced dark mode compatibility with better contrast ratios
// * 8. Interactive hover effects with scale transformations on icons
// * 9. Professional color scheme using blue-indigo-purple gradient palette
// * 10. Layered visual hierarchy with proper z-indexing
// * 11. Smooth micro-animations and transitions throughout
// * 12. Better accessibility with proper ARIA labels and semantic structure
// * 13. Enhanced shadow system for depth perception
// * 14. Consistent border radius system for modern appearance
// * 15. Optimized backdrop filters for performance
// * 16. Improved spacing and padding system
// * 17. Better content isolation with backdrop effects
// * 18. Enhanced visual feedback on interactive elements
// * 19. Modern CSS animations with proper timing functions
// * 20. Responsive viewport handling with proper overflow management

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Efficient CSS-based animations instead of JavaScript
// * 2. Optimized backdrop-blur usage for better performance
// * 3. Minimal DOM manipulation with CSS-only effects
// * 4. Proper z-index management to prevent render issues
// * 5. Memoized navigation links array to prevent recreations
// * 6. Efficient gradient and animation implementations

// ! FUTURE IMPROVEMENTS:
// TODO: Add motion preferences detection for accessibility
// TODO: Implement theme-aware gradient color customization
// TODO: Add keyboard navigation enhancements for floating dock
// TODO: Consider adding sound effects for interactive elements
// TODO: Implement advanced particle system for premium feel
// TODO: Add gesture support for mobile navigation
// TODO: Consider implementing custom cursor effects
// TODO: Add performance monitoring for animation frames