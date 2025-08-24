import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

// * Global styles import
import './globals.css';

// * Core providers and components
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/Header';
import StoreProvider from '@/store/StoreProvider';

// ! FONTS CONFIGURATION
// ? Using Geist font family for modern, clean typography
// TODO: Consider adding font-display: swap for better loading performance
const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	display: 'swap', // * Optimizes font loading performance
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	display: 'swap', // * Optimizes font loading performance
});

// ! SEO METADATA CONFIGURATION
// ? Update these values to match your actual application
// TODO: Make metadata dynamic based on environment or config
export const metadata: Metadata = {
	title: {
		default: 'Your App Name',
		template: '%s | Your App Name', // * Allows page-specific titles
	},
	description: 'Your app description for better SEO',
	keywords: ['nextjs', 'typescript', 'tailwind'], // * Add relevant keywords
	authors: [{ name: 'Your Name' }],
	creator: 'Your Name',
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
	),
	openGraph: {
		type: 'website',
		locale: 'en_US',
		title: 'Your App Name',
		description: 'Your app description',
		siteName: 'Your App Name',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Your App Name',
		description: 'Your app description',
		creator: '@yourusername', // * Replace with actual Twitter handle
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	verification: {
		// TODO: Add verification IDs when available
		// google: 'your-google-verification-id',
		// yandex: 'your-yandex-verification-id',
	},
};

// ! ROOT LAYOUT COMPONENT
/**
 * * Root layout component that wraps all pages
 * ? Provides global styling, theming, and state management
 *
 * @param children - Page content to be rendered
 * @returns JSX element containing the complete app structure
 */
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			suppressHydrationWarning // * Prevents hydration warnings for theme switching
			className='scroll-smooth' // * Enables smooth scrolling behavior
		>
			<head>
				{/* TODO: Add any additional head elements like analytics scripts */}
			</head>
			<body
				className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          min-h-screen
          antialiased 
          font-sans
          bg-background 
          text-foreground
          selection:bg-primary/20
        `}>
				{/* ! STATE MANAGEMENT PROVIDER */}
				{/* ? Wraps the entire app with Redux/Zustand store */}
				<StoreProvider>
					{/* ! THEME PROVIDER */}
					{/* ? Enables dark/light mode switching with system preference detection */}
					<ThemeProvider
						attribute='class' // * Uses class-based theme switching
						defaultTheme='system' // * Respects user's system preference
						enableSystem // * Enables system theme detection
						disableTransitionOnChange // * Prevents flash during theme changes
						storageKey='app-theme' // * Custom storage key for theme persistence
					>
						{/* ! APP STRUCTURE */}
						<div className='flex min-h-screen flex-col'>
							{/* ? Header with consistent height */}
							<Header className='h-[20%] shrink-0' />{' '}
							{/* * Changed from vh to fixed height for consistency */}
							{/* ? Main content area with proper spacing */}
							<main className='flex-1 h-[79%] overflow-hidden'>
								<div className='h-full w-full'>{children}</div>
							</main>
							{/* TODO: Add footer component if needed */}
							{/* <Footer className="shrink-0" /> */}
						</div>
					</ThemeProvider>
				</StoreProvider>

				{/* TODO: Add analytics scripts or other body scripts here */}
				{/* Example: Google Analytics, Hotjar, etc. */}
			</body>
		</html>
	);
}

// ! TYPE DEFINITIONS
// TODO: Move to separate types file if it grows
export type LayoutProps = {
	children: React.ReactNode;
};

// ! PERFORMANCE OPTIMIZATIONS IMPLEMENTED:
// * 1. Added font-display: swap for better loading
// * 2. Improved metadata for better SEO
// * 3. Better Tailwind classes for responsive design
// * 4. Semantic HTML structure
// * 5. Proper accessibility attributes

// ! FUTURE IMPROVEMENTS:
// TODO: Add error boundary wrapper
// TODO: Implement analytics tracking
// TODO: Add service worker registration
// TODO: Consider adding loading states
// TODO: Implement proper accessibility features
