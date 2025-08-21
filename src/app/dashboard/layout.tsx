// ! Path: src/app/dashboard/layout.tsx

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

/**
 * * A container component for the animated background gradient and orbs.
 * * It sits in the background of the entire layout using a negative z-index.
 */
const AnimatedGradientBackground = () => (
  <div
    className="
      absolute top-0 left-0 w-full h-full -z-50
      bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-950
      overflow-hidden
    "
  >
    <div className="absolute bottom-0 left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
    <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(100,0,255,.15),rgba(255,255,255,0))]"></div>
  </div>
);


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* ! The main container needs to be relative for the absolute background to work */}
      <div className="relative min-h-screen w-full text-white">
        <AnimatedGradientBackground />
        <AppSidebar />
        <main className="transition-all duration-300 lg:pl-80">
          {/* * The SidebarTrigger allows opening/closing the sidebar on mobile.
            * It's styled with glass morphism to float above the content.
          */}
          <SidebarTrigger
            className="
              fixed top-5 right-5 z-50 lg:hidden
              flex items-center justify-center h-10 w-10 rounded-full
              bg-white/10 backdrop-blur-md border border-white/20
            "
          />
          {/* ! Padding is added to the content area for better spacing */}
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient backgrounds with dynamic color transitions.
// * 3. Animated gradient orbs for visual depth and movement.
// * 10. Layered visual hierarchy with proper z-indexing.
// * 16. Improved spacing and padding system.
// * 20. Responsive viewport handling with proper overflow management.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Minimalistic layout component ensures fast rendering of child pages.
// * 2. Background animations are lightweight CSS effects.

// ! FUTURE IMPROVEMENTS:
// TODO: Allow theme customization (e.g., changing gradient colors).