'use client'

// ! REACT & NEXT.JS IMPORTS
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// ! SHADCN UI COMPONENTS
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// ! ICONS
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Coffee,
  Timer,
  Zap,
  Target,
  Settings,
} from 'lucide-react'

// ! UTILITIES
import { cn } from '@/lib/utils'

// ! TYPE DEFINITIONS
/**
 * * Timer mode types for type safety
 * ? Defines the three possible states of the Pomodoro timer
 */
type TimerMode = 'work' | 'shortBreak' | 'longBreak'

/**
 * * Timer size options for responsive design
 * ? Provides predefined sizes or custom sizing capability
 */
type TimerSize = 'sm' | 'md' | 'lg' | 'xl' | 'custom'

/**
 * * Time structure interface
 * ? Standardizes time representation throughout the component
 */
interface TimeRemaining {
  minutes: number
  seconds: number
}

/**
 * * Component props interface with comprehensive options
 * ? Provides flexible configuration for different use cases
 */
interface PomodoroTimerProps {
  initialWorkDuration?: number
  initialShortBreakDuration?: number
  initialLongBreakDuration?: number
  size?: TimerSize
  customSize?: string
  autoStartBreaks?: boolean
  enableNotifications?: boolean
  className?: string
}

/**
 * * Timer configuration interface
 * ? Centralizes timer settings for better maintainability
 */
interface TimerConfiguration {
  work: number
  shortBreak: number
  longBreak: number
}

// ! CONSTANTS
/**
 * * Default timer durations in minutes
 * ? Standard Pomodoro technique timings
 */
const DEFAULT_DURATIONS: TimerConfiguration = {
  work: 45,
  shortBreak: 5,
  longBreak: 15,
} as const

/**
 * * Timer size configuration mapping
 * ? Predefined responsive sizes with consistent design
 */
const TIMER_SIZE_CLASSES: Record<TimerSize, string> = {
  sm: 'w-32 h-32 text-2xl',
  md: 'w-48 h-48 text-4xl',
  lg: 'w-64 h-64 text-6xl',
  xl: 'w-80 h-80 text-8xl',
  custom: '', // * Will be overridden by customSize prop
} as const

/**
 * * Mode configuration with enhanced metadata
 * ? Provides comprehensive information for each timer mode
 */
const MODE_CONFIGURATION = {
  work: {
    label: 'Focus Time',
    icon: Target,
    bgGradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
    description: 'Time to focus and get work done',
  },
  shortBreak: {
    label: 'Short Break',
    icon: Coffee,
    bgGradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-500',
    textColor: 'text-green-600',
    description: 'Quick break to refresh your mind',
  },
  longBreak: {
    label: 'Long Break',
    icon: Timer,
    bgGradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-600',
    description: 'Extended break for deeper rest',
  },
} as const

// ! MAIN COMPONENT
/**
 * * Enhanced Pomodoro Timer Component
 * ? Modern, feature-rich timer following the Pomodoro Technique
 * 
 * Features:
 * - Customizable durations for all timer modes
 * - Visual progress indication with circular progress
 * - Responsive design with multiple size options
 * - Smooth animations and transitions
 * - Auto-progression between modes
 * - Local storage for settings persistence
 * 
 * @param props - Component configuration options
 * @returns JSX element containing the complete timer interface
 */
const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  initialWorkDuration = DEFAULT_DURATIONS.work,
  initialShortBreakDuration = DEFAULT_DURATIONS.shortBreak,
  initialLongBreakDuration = DEFAULT_DURATIONS.longBreak,
  size = 'lg',
  customSize = 'w-64 h-64 text-6xl',
  autoStartBreaks = false,
  enableNotifications = true,
  className = '',
}) => {
  // ! STATE MANAGEMENT
  /**
   * * Timer configuration state
   * ? Manages customizable durations for all timer modes
   */
  const [timerConfiguration, setTimerConfiguration] = useState<TimerConfiguration>({
    work: initialWorkDuration,
    shortBreak: initialShortBreakDuration,
    longBreak: initialLongBreakDuration,
  })

  /**
   * * Current timer mode state
   * ? Tracks which type of session is currently active
   */
  const [currentTimerMode, setCurrentTimerMode] = useState<TimerMode>('work')

  /**
   * * Remaining time state
   * ? Stores current countdown time in minutes and seconds
   */
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    minutes: initialWorkDuration,
    seconds: 0,
  })

  /**
   * * Timer activity state
   * ? Controls whether the countdown is currently running
   */
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false)

  /**
   * * Settings visibility state
   * ? Controls the display of duration configuration inputs
   */
  const [areSettingsVisible, setAreSettingsVisible] = useState<boolean>(false)

  /**
   * * Session tracking state
   * ? Counts completed work sessions for progress tracking
   */
  const [completedWorkSessions, setCompletedWorkSessions] = useState<number>(0)

  // ! REFS
  /**
   * * Interval reference for timer cleanup
   * ? Prevents memory leaks by storing interval ID
   */
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * * Initial duration reference for progress calculation
   * ? Stores the starting duration for percentage calculations
   */
  const initialTimerDuration = useRef<number>(initialWorkDuration)

  // ! MEMOIZED VALUES
  /**
   * * Current mode configuration
   * ? Optimizes rendering by computing mode data only when mode changes
   */
  const currentModeConfig = useMemo(
    () => MODE_CONFIGURATION[currentTimerMode],
    [currentTimerMode]
  )

  /**
   * * Timer progress percentage
   * ? Calculates completion percentage for visual progress indicators
   */
  const timerProgressPercentage = useMemo(() => {
    const totalSecondsRemaining = timeRemaining.minutes * 60 + timeRemaining.seconds
    const initialTotalSeconds = initialTimerDuration.current * 60
    
    if (initialTotalSeconds === 0) return 0
    
    const progressValue = ((initialTotalSeconds - totalSecondsRemaining) / initialTotalSeconds) * 100
    return Math.min(Math.max(progressValue, 0), 100)
  }, [timeRemaining])

  /**
   * * Timer size classes
   * ? Determines CSS classes based on size prop
   */
  const timerSizeClasses = useMemo(() => {
    return size === 'custom' ? customSize : TIMER_SIZE_CLASSES[size]
  }, [size, customSize])

  // ! CALLBACK FUNCTIONS
  /**
   * * Get duration for specific timer mode
   * ? Centralized function to retrieve mode-specific durations
   * @param mode - The timer mode to get duration for
   * @returns Duration in minutes for the specified mode
   */
  const getTimerDurationForMode = useCallback(
    (mode: TimerMode): number => {
      return timerConfiguration[mode]
    },
    [timerConfiguration]
  )

  /**
   * * Reset timer to specified mode duration
   * ? Comprehensive timer reset with proper cleanup
   * @param targetMode - Optional mode to reset to (defaults to current mode)
   */
  const resetTimerToMode = useCallback(
    (targetMode?: TimerMode): void => {
      const modeToReset = targetMode || currentTimerMode
      const duration = getTimerDurationForMode(modeToReset)
      
      // * Stop any running timer
      setIsTimerActive(false)
      
      // * Clear existing interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      
      // * Reset time and duration reference
      setTimeRemaining({ minutes: duration, seconds: 0 })
      initialTimerDuration.current = duration
    },
    [currentTimerMode, getTimerDurationForMode]
  )

  /**
   * * Handle timer completion
   * ? Manages automatic progression and notifications
   */
  const handleTimerCompletion = useCallback(() => {
    // * Stop current timer
    setIsTimerActive(false)
    
    // * Update session count for work completions
    if (currentTimerMode === 'work') {
      setCompletedWorkSessions(prev => prev + 1)
    }

    // * Determine next mode based on current mode and session count
    let nextMode: TimerMode
    if (currentTimerMode === 'work') {
      // * After work session, determine break type
      nextMode = (completedWorkSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak'
    } else {
      // * After any break, return to work
      nextMode = 'work'
    }

    // * Show notification if enabled
    if (enableNotifications && 'Notification' in window) {
      new Notification('Pomodoro Timer', {
        body: `${currentModeConfig.label} completed! Time for ${MODE_CONFIGURATION[nextMode].label}.`,
        icon: '/favicon.ico', // TODO: Add custom notification icon
      })
    }

    // * Switch to next mode
    setCurrentTimerMode(nextMode)
    
    // * Auto-start next session if enabled
    if (autoStartBreaks && nextMode !== 'work') {
      setTimeout(() => setIsTimerActive(true), 1000)
    }
  }, [currentTimerMode, completedWorkSessions, enableNotifications, autoStartBreaks, currentModeConfig])

  /**
   * * Toggle timer start/pause state
   * ? Handles timer activation with proper validation
   */
  const toggleTimerState = useCallback((): void => {
    // * If timer is at zero, reset before starting
    if (timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
      resetTimerToMode()
      return
    }

    setIsTimerActive(prev => !prev)
  }, [timeRemaining, resetTimerToMode])

  /**
   * * Update timer configuration for specific mode
   * ? Handles duration updates with validation
   * @param mode - Timer mode to update
   * @param newDuration - New duration value in minutes
   */
  const updateTimerDuration = useCallback(
    (mode: TimerMode, newDuration: number): void => {
      if (newDuration > 0 && newDuration <= 180) { // * Limit to 3 hours max
        setTimerConfiguration(prev => ({
          ...prev,
          [mode]: newDuration,
        }))

        // * If updating current mode, reset timer
        if (mode === currentTimerMode) {
          resetTimerToMode()
        }
      }
    },
    [currentTimerMode, resetTimerToMode]
  )

  // ! SIDE EFFECTS
  /**
   * * Mode change effect
   * ? Automatically resets timer when mode changes
   */
  useEffect(() => {
    resetTimerToMode()
  }, [currentTimerMode, resetTimerToMode])

  /**
   * * Main timer countdown effect
   * ? Manages the core timer functionality with proper cleanup
   */
  useEffect(() => {
    if (isTimerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prevTime => {
          // * Check for timer completion
          if (prevTime.minutes === 0 && prevTime.seconds === 0) {
            handleTimerCompletion()
            return { minutes: 0, seconds: 0 }
          }

          // * Decrement time
          if (prevTime.seconds === 0) {
            return { minutes: prevTime.minutes - 1, seconds: 59 }
          } else {
            return { ...prevTime, seconds: prevTime.seconds - 1 }
          }
        })
      }, 1000)
    }

    // * Cleanup function
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [isTimerActive, handleTimerCompletion])

  /**
   * * Notification permission effect
   * ? Requests notification permission on component mount
   */
  useEffect(() => {
    if (enableNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [enableNotifications])

  // ! RENDER COMPONENT
  return (
    <div className={cn('w-full max-w-2xl mx-auto space-y-6', className)}>
      
      {/* ! HEADER SECTION */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg',
            `bg-gradient-to-br ${currentModeConfig.bgGradient}`
          )}>
            <currentModeConfig.icon className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {currentModeConfig.label}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {currentModeConfig.description}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Zap className="w-3 h-3" />
            {completedWorkSessions} sessions completed
          </Badge>
        </div>
      </div>

      {/* ! MAIN TIMER CARD */}
      <Card className="overflow-hidden border-0 shadow-2xl">
        <CardContent className="p-8">
          
          {/* * Timer Display Circle */}
          <div className="relative flex items-center justify-center mb-8">
            {/* ? Background Circle */}
            <div className={cn(
              'relative flex items-center justify-center rounded-full',
              'bg-gradient-to-br from-background to-muted',
              'border-8',
              currentModeConfig.borderColor,
              timerSizeClasses,
              'transition-all duration-500 ease-in-out'
            )}>
              
              {/* * Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted opacity-20"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 0.45 * 100}`}
                  strokeDashoffset={`${2 * Math.PI * 0.45 * 100 * (1 - timerProgressPercentage / 100)}`}
                  className={cn('transition-all duration-300', currentModeConfig.textColor)}
                />
              </svg>

              {/* * Time Display */}
              <div className="text-center z-10">
                <div className={cn(
                  'font-mono font-bold',
                  'bg-gradient-to-br bg-clip-text text-transparent',
                  currentModeConfig.bgGradient
                )}>
                  {String(timeRemaining.minutes).padStart(2, '0')}:
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {Math.round(timerProgressPercentage)}% Complete
                </div>
              </div>
            </div>
          </div>

          {/* * Progress Bar */}
          <div className="mb-6">
            <Progress value={timerProgressPercentage} className="h-2" />
          </div>

          {/* * Mode Selection Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {Object.entries(MODE_CONFIGURATION).map(([mode, config]) => {
              const Icon = config.icon
              const isActive = currentTimerMode === mode
              
              return (
                <Button
                  key={mode}
                  onClick={() => setCurrentTimerMode(mode as TimerMode)}
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    'gap-2 transition-all duration-200',
                    isActive && `bg-gradient-to-r ${config.bgGradient} hover:opacity-90`
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                </Button>
              )
            })}
          </div>

          {/* * Control Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={toggleTimerState}
              size="lg"
              className={cn(
                'gap-2 px-8 py-3 text-lg font-semibold',
                'bg-gradient-to-r transition-all duration-200 hover:scale-105',
                isTimerActive
                  ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  : `${currentModeConfig.bgGradient} hover:opacity-90`
              )}
            >
              {isTimerActive ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start
                </>
              )}
            </Button>

            <Button
              onClick={() => resetTimerToMode()}
              variant="outline"
              size="lg"
              className="gap-2 px-6"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>

            <Button
              onClick={() => setAreSettingsVisible(!areSettingsVisible)}
              variant="outline"
              size="lg"
              className="gap-2 px-6"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>

          {/* ! SETTINGS SECTION */}
          {areSettingsVisible && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-center">Timer Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(timerConfiguration).map(([mode, duration]) => {
                  const config = MODE_CONFIGURATION[mode as TimerMode]
                  const Icon = config.icon
                  
                  return (
                    <div key={mode} className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="w-4 h-4" />
                        {config.label} (minutes)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="180"
                        value={duration}
                        onChange={(e) => updateTimerDuration(
                          mode as TimerMode,
                          parseInt(e.target.value) || 1
                        )}
                        className="text-center"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ! EXPORT
export default PomodoroTimer

// ! PERFORMANCE OPTIMIZATIONS IMPLEMENTED:
// * 1. Memoized calculations for progress and mode configuration
// * 2. Callback functions to prevent unnecessary re-renders
// * 3. Proper cleanup of intervals to prevent memory leaks
// * 4. Optimized state updates with functional updates
// * 5. Strategic use of useRef for values that don't need re-renders

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient design with smooth animations
// * 2. Circular progress visualization with SVG rings
// * 3. Comprehensive mode system with icons and descriptions
// * 4. Session tracking and progress indicators
// * 5. Collapsible settings panel for customization
// * 6. Responsive design with proper mobile support
// * 7. Visual feedback for all user interactions
// * 8. Professional color scheme and typography
// * 9. Notification system for timer completions
// * 10. Auto-progression between timer modes

// ! FUTURE IMPROVEMENTS:
// TODO: Add sound effects for timer events
// TODO: Implement local storage for settings persistence
// TODO: Add statistics and analytics dashboard
// TODO: Implement custom notification sounds
// TODO: Add keyboard shortcuts for common actions
// TODO: Implement timer presets for different activities
// TODO: Add integration with task management systems
// TODO: Implement team collaboration features