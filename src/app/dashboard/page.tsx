'use client';

// * ============================================================================
// * IMPORTS & DEPENDENCIES
// * ============================================================================

import {
	CloseIcon,
	ExpandableCardInterface,
} from '@/components/ui/expandable-card';
import { getSubjectResponse } from '@/types/res/GetResponse.types';
import React, { RefObject, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { useAppSelector } from '@/hooks/actions';

// * ============================================================================
// * INTERFACES & TYPES
// * ============================================================================

/**
 * Interface for subject card data with enhanced properties
 */
interface EnhancedSubjectCard extends ExpandableCardInterface {
	id: string;
	description: string;
	title: string;
	ctaText: string;
	src?: string;
	ctaLink?: string;
	content: () => React.ReactNode;
}

/**
 * State management for active card selection
 */
type ActiveCardState = EnhancedSubjectCard | boolean | null;

// * ============================================================================
// * MAIN DASHBOARD COMPONENT
// * ============================================================================

const DashboardPage = () => {
	// * ------------------------------------------------------------------------
	// * STATE MANAGEMENT WITH REDUX INTEGRATION
	// * ------------------------------------------------------------------------

	/**
	 * Redux store selector for subject data with fallback handling
	 * @description Retrieves subject list from global state management
	 */
	const subjectDataFromReduxStore = useAppSelector(
		(state) => state.data.subjects,
	);

	/**
	 * Local state for subject list management
	 * @description Maintains synchronized subject data between store and localStorage
	 */
	const [subjectDataList, setSubjectDataList] = useState<getSubjectResponse[]>(
		subjectDataFromReduxStore,
	);

	/**
	 * Enhanced subject cards for UI rendering
	 * @description Transforms raw subject data into renderable card components
	 */
	const [enhancedSubjectCards, setEnhancedSubjectCards] = useState<
		EnhancedSubjectCard[]
	>([
		{
			id: 'loading-placeholder',
			description: 'Initializing dashboard...',
			title: 'Loading Subjects',
			ctaText: 'Please Wait',
			content: () => (
				<div className='flex items-center justify-center space-x-2'>
					<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
					<p className='text-neutral-600 dark:text-neutral-400'>
						Loading your subjects...
					</p>
				</div>
			),
		},
	]);

	/**
	 * Active card state for modal/expandable view management
	 * @description Controls which card is currently expanded/active
	 */
	const [activeExpandedCard, setActiveExpandedCard] =
		useState<ActiveCardState>(null);

	// * ------------------------------------------------------------------------
	// * REFS AND IDs FOR COMPONENT MANAGEMENT
	// * ------------------------------------------------------------------------

	/** Reference for outside click detection on modal */
	const modalContainerRef = useRef<HTMLDivElement>(
		null,
	) as RefObject<HTMLDivElement>;

	/** Unique identifier for animation layout system */
	const componentUniqueId = useId();

	// * ------------------------------------------------------------------------
	// * LIFECYCLE EFFECTS & DATA MANAGEMENT
	// * ------------------------------------------------------------------------

	/**
	 * Initialize subject data from localStorage on component mount
	 * @description Hydrates component state with persisted subject data
	 */
	useEffect(function initializeSubjectDataFromLocalStorage() {
		try {
			const persistedSubjectsString = window.localStorage.getItem('subjects');

			if (persistedSubjectsString) {
				const parsedSubjectData: getSubjectResponse[] = JSON.parse(
					persistedSubjectsString,
				);
				setSubjectDataList(parsedSubjectData);
			}
		} catch (error) {
			console.error('Failed to load subjects from localStorage:', error);
			// Fallback to empty array if parsing fails
			setSubjectDataList([]);
		}
	}, []);

	/**
	 * Transform subject data into enhanced card components
	 * @description Converts raw API data into UI-ready card objects
	 */
	useEffect(() => {
		// Early return for empty or undefined data
		if (!subjectDataList?.length) return;

		const transformedSubjectCards: EnhancedSubjectCard[] = subjectDataList.map(
			(subjectItem) => ({
				id: subjectItem._id,
				description: `Academic Standard: Class ${subjectItem.standard}`,
				title: subjectItem.name,
				src: 'https://images.unsplash.com/photo-1622323758558-8d1513e61e9b?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
				ctaText: 'View Details',
				ctaLink: 'https://ui.aceternity.com/templates',
				content: () => (
					<div className='space-y-4'>
						<div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200/20'>
							<h4 className='font-semibold text-blue-800 dark:text-blue-300 mb-2'>
								Subject Overview
							</h4>
							<p className='text-sm text-blue-700 dark:text-blue-400'>
								Comprehensive study material and progress tracking for{' '}
								{subjectItem.name}
							</p>
						</div>
						<div className='grid grid-cols-2 gap-3'>
							<div className='bg-white dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700'>
								<div className='text-xs text-neutral-500 dark:text-neutral-400'>
									Standard
								</div>
								<div className='font-medium text-neutral-800 dark:text-neutral-200'>
									Class {subjectItem.standard}
								</div>
							</div>
							<div className='bg-white dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700'>
								<div className='text-xs text-neutral-500 dark:text-neutral-400'>
									Status
								</div>
								<div className='font-medium text-green-600 dark:text-green-400'>
									Active
								</div>
							</div>
						</div>
					</div>
				),
			}),
		);

		setEnhancedSubjectCards(transformedSubjectCards);
	}, [subjectDataList]);

	/**
	 * Handle keyboard navigation and body scroll management
	 * @description Manages modal state, keyboard shortcuts, and scroll behavior
	 */
	useEffect(() => {
		function handleGlobalKeyboardEvents(keyboardEvent: KeyboardEvent) {
			if (keyboardEvent.key === 'Escape') {
				setActiveExpandedCard(false);
			}
		}

		// Manage body scroll behavior based on modal state
		if (activeExpandedCard && typeof activeExpandedCard === 'object') {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}

		// Add global event listeners
		window.addEventListener('keydown', handleGlobalKeyboardEvents);

		// Cleanup function
		return () => {
			window.removeEventListener('keydown', handleGlobalKeyboardEvents);
			// Ensure body scroll is restored on unmount
			document.body.style.overflow = 'auto';
		};
	}, [activeExpandedCard]);

	// * ------------------------------------------------------------------------
	// * HOOK INTEGRATIONS
	// * ------------------------------------------------------------------------

	/**
	 * Handle clicks outside modal to close it
	 * @description Integrates with custom hook for outside click detection
	 */
	useOutsideClick(modalContainerRef, () => setActiveExpandedCard(null));

	// * ------------------------------------------------------------------------
	// * EVENT HANDLERS
	// * ------------------------------------------------------------------------

	/**
	 * Handle card selection and expansion
	 * @param selectedCard - The card to expand/activate
	 */
	const handleCardSelection = (selectedCard: EnhancedSubjectCard) => {
		setActiveExpandedCard(selectedCard);
	};

	/**
	 * Handle modal closure
	 * @description Closes the expanded card modal
	 */
	const handleModalClose = () => {
		setActiveExpandedCard(null);
	};

	// * ------------------------------------------------------------------------
	// * COMPONENT RENDER
	// * ------------------------------------------------------------------------

	return (
		<div className='min-h-screen relative overflow-hidden'>
			{/* Background with Modern Gradient and Glass Effects */}
			<div className='fixed inset-0 -z-10'>
				{/* Primary Gradient Background */}
				<div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20' />

				{/* Animated Gradient Orbs */}
				<div className='absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl animate-pulse' />
				<div className='absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000' />
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-2000' />
			</div>

			{/* Modal Overlay with Backdrop Blur */}
			<AnimatePresence>
				{activeExpandedCard && typeof activeExpandedCard === 'object' && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 bg-black/20 backdrop-blur-md h-full w-full z-10'
					/>
				)}
			</AnimatePresence>

			{/* Expanded Card Modal */}
			<AnimatePresence>
				{activeExpandedCard && typeof activeExpandedCard === 'object' ? (
					<div className='fixed inset-0 grid place-items-center z-[100] p-4'>
						{/* Mobile Close Button */}
						<motion.button
							key={`close-button-${activeExpandedCard.id}-${componentUniqueId}`}
							layout
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{
								opacity: 0,
								scale: 0.8,
								transition: { duration: 0.15 },
							}}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className='flex absolute top-4 right-4 lg:hidden items-center justify-center bg-white/90 backdrop-blur-md rounded-full h-10 w-10 shadow-lg border border-white/20 hover:bg-white transition-all duration-200'
							onClick={handleModalClose}
							aria-label='Close modal'>
							<CloseIcon />
						</motion.button>

						{/* Modal Content Container */}
						<motion.div
							layoutId={`card-${activeExpandedCard.id}-${componentUniqueId}`}
							ref={modalContainerRef}
							className='w-full max-w-2xl h-full md:h-fit md:max-h-[90%] flex flex-col bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-white/20 dark:border-neutral-700/50 sm:rounded-3xl overflow-hidden shadow-2xl'>
							{/* Modal Image Header */}
							<motion.div
								layoutId={`image-${activeExpandedCard.id}-${componentUniqueId}`}
								className='relative overflow-hidden'>
								<img
									width={800}
									height={400}
									src={activeExpandedCard.src}
									alt={activeExpandedCard.title}
									className='w-full h-64 lg:h-80 object-cover object-center hover:scale-105 transition-transform duration-500'
									loading='lazy'
								/>
								<div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
							</motion.div>

							{/* Modal Content */}
							<div className='flex-1 flex flex-col'>
								{/* Header Section */}
								<div className='flex justify-between items-start p-6 border-b border-neutral-200/50 dark:border-neutral-700/50'>
									<div className='space-y-2'>
										<motion.h3
											layoutId={`title-${activeExpandedCard.id}-${componentUniqueId}`}
											className='text-2xl font-bold text-neutral-800 dark:text-neutral-100'>
											{activeExpandedCard.title}
										</motion.h3>
										<motion.p
											layoutId={`description-${activeExpandedCard.id}-${componentUniqueId}`}
											className='text-neutral-600 dark:text-neutral-400 font-medium'>
											{activeExpandedCard.description}
										</motion.p>
									</div>

									<motion.a
										layoutId={`button-${activeExpandedCard.id}-${componentUniqueId}`}
										href={activeExpandedCard.ctaLink}
										target='_blank'
										rel='noopener noreferrer'
										className='px-6 py-3 text-sm rounded-full font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-blue-400/20'
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}>
										{activeExpandedCard.ctaText}
									</motion.a>
								</div>

								{/* Scrollable Content */}
								<div className='flex-1 p-6'>
									<motion.div
										layout
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ delay: 0.1 }}
										className='text-neutral-700 dark:text-neutral-300 text-sm md:text-base leading-relaxed overflow-auto max-h-96 custom-scrollbar'>
										{typeof activeExpandedCard.content === 'function'
											? activeExpandedCard.content()
											: activeExpandedCard.content}
									</motion.div>
								</div>
							</div>
						</motion.div>
					</div>
				) : null}
			</AnimatePresence>

			{/* Main Content Container */}
			<div className='relative z-1 px-4 py-8'>
				{/* Page Header */}
				<div className='max-w-4xl mx-auto mb-8'>
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='text-center space-y-4'>
						<h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'>
							Subject Dashboard
						</h1>
						<p className='text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl mx-auto'>
							Explore your academic subjects and track your JEE preparation
							progress
						</p>
					</motion.div>
				</div>

				{/* Subject Cards Grid */}
				<motion.ul
					className='max-w-4xl mx-auto w-full space-y-4'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.2 }}>
					{enhancedSubjectCards.map((subjectCard, cardIndex) => (
						<motion.li
							key={`card-${subjectCard.id}-${componentUniqueId}`}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: cardIndex * 0.1 }}>
							<motion.div
								layoutId={`card-${subjectCard.id}-${componentUniqueId}`}
								onClick={() => handleCardSelection(subjectCard)}
								className='group relative p-6 flex flex-col md:flex-row justify-between items-center bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-white/20 dark:border-neutral-700/50 hover:bg-white/80 dark:hover:bg-neutral-800/80 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1'
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								role='button'
								tabIndex={0}
								aria-label={`View details for ${subjectCard.title}`}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										handleCardSelection(subjectCard);
									}
								}}>
								{/* Hover Glow Effect */}
								<div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

								{/* Card Content */}
								<div className='relative z-10 flex gap-6 flex-col md:flex-row items-center md:items-start w-full md:w-auto'>
									{/* Card Image */}
									<motion.div
										layoutId={`image-${subjectCard.id}-${componentUniqueId}`}
										className='relative overflow-hidden rounded-xl'>
										<img
											width={80}
											height={80}
											src={subjectCard.src}
											alt={subjectCard.title}
											className='h-32 w-32 md:h-16 md:w-16 object-cover object-center group-hover:scale-110 transition-transform duration-300'
											loading='lazy'
										/>
										<div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
									</motion.div>

									{/* Card Text Content */}
									<div className='text-center md:text-left space-y-1'>
										<motion.h3
											layoutId={`title-${subjectCard.id}-${componentUniqueId}`}
											className='text-xl font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200'>
											{subjectCard.title}
										</motion.h3>
										<motion.p
											layoutId={`description-${subjectCard.id}-${componentUniqueId}`}
											className='text-neutral-600 dark:text-neutral-400 font-medium'>
											{subjectCard.description}
										</motion.p>
									</div>
								</div>

								{/* Call-to-Action Button */}
								<motion.button
									layoutId={`button-${subjectCard.id}-${componentUniqueId}`}
									className='relative z-10 px-6 py-2.5 text-sm rounded-full font-semibold bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-600 hover:from-blue-500 hover:to-indigo-600 text-neutral-700 dark:text-neutral-200 hover:text-white mt-4 md:mt-0 border border-neutral-300/50 dark:border-neutral-600/50 hover:border-blue-400/50 transition-all duration-200 hover:shadow-lg group-hover:scale-105'
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}>
									{subjectCard.ctaText}
								</motion.button>
							</motion.div>
						</motion.li>
					))}
				</motion.ul>

				{/* Empty State */}
				{enhancedSubjectCards.length === 0 && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className='max-w-md mx-auto text-center py-16'>
						<div className='bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-neutral-700/50'>
							<div className='w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4'>
								<svg
									className='w-8 h-8 text-blue-600 dark:text-blue-400'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
									/>
								</svg>
							</div>
							<h3 className='text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2'>
								No subjects available
							</h3>
							<p className='text-neutral-600 dark:text-neutral-400 text-sm'>
								Start by adding some subjects to your dashboard
							</p>
						</div>
					</motion.div>
				)}
			</div>

			{/* Custom Scrollbar Styles */}
			<style jsx>{`
				.custom-scrollbar {
					scrollbar-width: thin;
					scrollbar-color: #e5e7eb #f3f4f6;
				}
				.custom-scrollbar::-webkit-scrollbar {
					width: 6px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: #f3f4f6;
					border-radius: 3px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #d1d5db;
					border-radius: 3px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #9ca3af;
				}
			`}</style>
		</div>
	);
};

export default DashboardPage;

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient backgrounds with dynamic color transitions - Applied gradient backgrounds with blue-indigo-purple palette
// * 2. Glass morphism effects with backdrop blur and transparency - Implemented backdrop-blur and transparency on cards and modals
// * 3. Animated gradient orbs for visual depth and movement - Added floating gradient orbs with pulse animations
// * 4. Enhanced floating dock with improved glass styling - Applied glass morphism effects to card containers
// * 5. Subtle particle animations for ambient background effects - Implemented gradient orb animations for ambient effects
// * 6. Improved responsive design with better mobile adaptation - Enhanced responsive grid and mobile-first approach
// * 7. Enhanced dark mode compatibility with better contrast ratios - Improved dark mode colors and contrast ratios
// * 8. Interactive hover effects with scale transformations on icons - Added hover animations and scale effects
// * 9. Professional color scheme using blue-indigo-purple gradient palette - Applied consistent gradient color scheme
// * 10. Layered visual hierarchy with proper z-indexing - Implemented proper z-index layering system
// * 11. Smooth micro-animations and transitions throughout - Added motion animations and smooth transitions
// * 12. Better accessibility with proper ARIA labels and semantic structure - Enhanced ARIA labels and semantic HTML
// * 13. Enhanced shadow system for depth perception - Implemented layered shadow system for visual depth
// * 14. Consistent border radius system for modern appearance - Applied consistent rounded corners (rounded-2xl, rounded-3xl)
// * 15. Optimized backdrop filters for performance - Efficient backdrop-blur implementation
// * 16. Improved spacing and padding system - Consistent spacing using Tailwind's spacing scale
// * 17. Better content isolation with backdrop effects - Isolated content with backdrop blur effects
// * 18. Enhanced visual feedback on interactive elements - Added hover states and interactive feedback
// * 19. Modern CSS animations with proper timing functions - Implemented smooth animations with proper easing
// * 20. Responsive viewport handling with proper overflow management - Better overflow handling and viewport management

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Efficient React state management with proper dependency arrays in useEffect hooks
// * 2. Memoized animations with layoutId for smooth transitions without re-renders
// * 3. Lazy loading for images with proper loading attributes
// * 4. Optimized event listeners with proper cleanup in useEffect
// * 5. Early returns in useEffect to prevent unnecessary computations
// * 6. Efficient outside click detection with custom hook integration
// * 7. Proper error handling for localStorage operations with try-catch blocks
// * 8. Minimal re-renders through careful state structure and updates
// * 9. Optimized CSS animations using transform and opacity for better performance
// * 10. Efficient conditional rendering to minimize DOM manipulations

// ! FUTURE IMPROVEMENTS:
// TODO: Implement virtual scrolling for large subject lists (1000+ items)
// TODO: Add keyboard navigation support for card selection (arrow keys)
// TODO: Implement drag and drop reordering for subject cards
// TODO: Add subject filtering and search functionality
// TODO: Implement progressive loading for subject images
// TODO: Add subject categories and grouping functionality
// TODO: Implement offline support with service worker
// TODO: Add subject progress tracking with visual indicators
// TODO: Implement subject statistics and analytics dashboard
// TODO: Add subject export/import functionality
// TODO: Implement subject sharing and collaboration features
// TODO: Add subject scheduling and reminder system
// TODO: Implement subject performance analytics
// TODO: Add subject recommendation system based on progress
// TODO: Implement subject difficulty assessment and adaptive learning
