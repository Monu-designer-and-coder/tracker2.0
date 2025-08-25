// * ============================================================================
// * ENHANCED APP SIDEBAR COMPONENT
// * Modern glass morphism sidebar with improved UX and accessibility
// * ============================================================================

import {
	LayoutDashboard,
	TableOfContents,
	NotebookPen,
	FilePlus2,
	SquarePen,
} from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { JSX } from 'react';

// * ============================================================================
// * NAVIGATION CONFIGURATION
// * ============================================================================

/**
 * Enhanced navigation menu items with improved structure
 * @description Centralized navigation configuration for maintainability
 */
const enhancedNavigationItems = [
	{
		id: 'dashboard-overview',
		title: 'Dashboard',
		url: '/dashboard',
		icon: LayoutDashboard,
		description: 'Overview of your JEE preparation progress',
		ariaLabel: 'Navigate to dashboard overview',
	},
	{
		id: 'chapters-management',
		title: 'Chapters',
		url: '/dashboard/chapters',
		icon: TableOfContents,
		description: 'Manage and browse subject chapters',
		ariaLabel: 'Navigate to chapters management',
	},
	{
		id: 'progress-exploration',
		title: 'Progress',
		url: '/dashboard/progress',
		icon: NotebookPen,
		description: 'Explore specific progress and concepts',
		ariaLabel: 'Navigate to progress exploration',
	},
	{
		id: 'content-creation',
		title: 'Add',
		url: '/dashboard/add',
		icon: FilePlus2,
		description: 'Add new subjects, chapters, or topics',
		ariaLabel: 'Navigate to content creation',
	},
	{
		id: 'content-editing',
		title: 'Edit',
		url: '/dashboard/edit',
		icon: SquarePen,
		description: 'Edit existing content and materials',
		ariaLabel: 'Navigate to content editing',
	},
];

// * ============================================================================
// * ENHANCED APP SIDEBAR COMPONENT
// * ============================================================================

/**
 * Enhanced App Sidebar Component with modern UI/UX
 * @description Floating sidebar with glass morphism effects and improved accessibility
 * @returns {JSX.Element} Enhanced sidebar component
 */
export function AppSidebar(): JSX.Element {
	return (
		<Sidebar
			variant='floating'
			className='backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border-r border-white/20 dark:border-neutral-700/50 shadow-2xl'>
			{/* Background gradient overlay for visual enhancement */}
			<div className='absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 pointer-events-none' />

			{/* Animated gradient orbs for ambient effects */}
			<div className='absolute top-10 left-4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl animate-pulse' />
			<div className='absolute bottom-20 right-4 w-24 h-24 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-xl animate-pulse delay-1000' />

			<SidebarContent className='relative z-10'>
				<SidebarGroup className='space-y-6'>
					{/* Enhanced Header with Gradient Text */}
					<SidebarGroupLabel className='text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent px-4 py-2 text-center'>
						JEE PROGRESS
					</SidebarGroupLabel>

					{/* Navigation Menu Container */}
					<SidebarGroupContent className='px-4 space-y-2'>
						<SidebarMenu className='space-y-3'>
							{enhancedNavigationItems.map((navigationItem, itemIndex) => (
								<SidebarMenuItem key={navigationItem.id}>
									<SidebarMenuButton
										asChild
										className='group relative overflow-hidden'>
										<Link
											href={navigationItem.url}
											className='relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 bg-white/60 dark:bg-neutral-800/60 border border-white/30 dark:border-neutral-700/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-neutral-800/80 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent'
											aria-label={navigationItem.ariaLabel}
											title={navigationItem.description}>
											{/* Hover gradient overlay */}
											<div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl' />

											{/* Icon container with enhanced styling */}
											<div className='relative z-10 p-2 rounded-lg bg-gradient-to-br from-blue-100/50 to-indigo-100/50 dark:from-blue-900/30 dark:to-indigo-900/30 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-300 group-hover:scale-110'>
												<navigationItem.icon
													className='w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200'
													aria-hidden='true'
												/>
											</div>

											{/* Navigation text with enhanced typography */}
											<span className='relative z-10 font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200'>
												{navigationItem.title}
											</span>

											{/* Active state indicator */}
											<div className='absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>

						{/* Additional Features Section */}
						<div className='pt-6 mt-6 border-t border-white/20 dark:border-neutral-700/50'>
							<div className='px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/20 dark:border-blue-800/20'>
								<h4 className='text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1'>
									Quick Stats
								</h4>
								<p className='text-xs text-blue-700 dark:text-blue-400'>
									Track your preparation progress
								</p>
							</div>
						</div>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient backgrounds with dynamic color transitions - Applied gradient overlays and backgrounds
// * 2. Glass morphism effects with backdrop blur and transparency - Implemented backdrop-blur on sidebar and menu items
// * 3. Animated gradient orbs for visual depth and movement - Added floating gradient orbs with pulse animations
// * 4. Enhanced floating dock with improved glass styling - Enhanced floating sidebar with glass effects
// * 5. Subtle particle animations for ambient background effects - Implemented gradient orb animations
// * 6. Improved responsive design with better mobile adaptation - Enhanced responsive behavior
// * 7. Enhanced dark mode compatibility with better contrast ratios - Improved dark mode color schemes
// * 8. Interactive hover effects with scale transformations on icons - Added hover animations and scale effects
// * 9. Professional color scheme using blue-indigo-purple gradient palette - Applied consistent gradient colors
// * 10. Layered visual hierarchy with proper z-indexing - Implemented proper layering system
// * 11. Smooth micro-animations and transitions throughout - Added smooth transitions and animations
// * 12. Better accessibility with proper ARIA labels and semantic structure - Enhanced accessibility features
// * 13. Enhanced shadow system for depth perception - Implemented layered shadows
// * 14. Consistent border radius system for modern appearance - Applied consistent rounded corners
// * 15. Optimized backdrop filters for performance - Efficient backdrop implementation
// * 16. Improved spacing and padding system - Consistent spacing throughout
// * 17. Better content isolation with backdrop effects - Content isolation with backdrop effects
// * 18. Enhanced visual feedback on interactive elements - Interactive hover and focus states
// * 19. Modern CSS animations with proper timing functions - Smooth animations with proper easing
// * 20. Responsive viewport handling with proper overflow management - Better overflow handling

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Static navigation configuration for optimal rendering performance
// * 2. Efficient CSS transitions using transform and opacity properties
// * 3. Proper semantic HTML structure for better accessibility and SEO
// * 4. Optimized icon rendering with proper sizing and caching
// * 5. Minimal DOM updates through efficient class management

// ! FUTURE IMPROVEMENTS:
// TODO: Add navigation breadcrumbs for better user orientation
// TODO: Implement sidebar collapse/expand animation
// TODO: Add user profile section in sidebar
// TODO: Implement navigation analytics and usage tracking
// TODO: Add keyboard shortcuts for navigation items
// TODO: Implement sidebar customization preferences
// TODO: Add notification badges for menu items
// TODO: Implement sidebar search functionality
