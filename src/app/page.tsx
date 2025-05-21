
"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "@/components/settings";
import { useApp } from "@/lib/app-context";
import { AnimatedComponent, AnimatedList, AnimatedText } from "@/components/animated-component";
import { fadeIn, slideUp, pulse, floating, slideInLeft, slideInRight } from "@/lib/animations";

// Define the form schema with Zod
const formSchema = z.object({
  bedtime: z.string().min(1, { message: "Bedtime is required" }),
  fallAsleepTime: z.coerce
    .number()
    .min(0, { message: "Must be a positive number" })
    .max(120, { message: "Must be less than 120 minutes" }),
  wakeUpTime: z.string().min(1, { message: "Wake-up time is required" }),
});

// Define the sleep cycle duration in minutes
const SLEEP_CYCLE_DURATION = 90; // 90 minutes per cycle

// Define the sleep stages within a cycle (in minutes)
const SLEEP_STAGES = {
  light: 25, // Light sleep (Stage 1 & 2)
  deep: 35, // Deep sleep (Stage 3)
  rem: 30, // REM sleep
};

// Define the recommended sleep duration ranges in hours
const RECOMMENDED_SLEEP_RANGES = {
  min: 7, // Minimum recommended sleep (7 hours)
  optimal: 8, // Optimal sleep amount (8 hours)
  max: 9, // Maximum recommended sleep (9 hours)
};

// Sleep quality factors
const QUALITY_FACTORS = {
  completeCycle: 1.3, // Bonus for waking up at the end of a complete cycle
  lightSleepWakeup: 1.5, // Major bonus for waking up during light sleep phase
  remSleepWakeup: 0.7, // Major penalty for waking up during REM sleep
  deepSleepWakeup: 0.5, // Severe penalty for waking up during deep sleep
  optimalDuration: 1.2, // Bonus for sleeping within the optimal range
  tooShort: 0.7, // Penalty for too little sleep
  tooLong: 0.8, // Penalty for too much sleep
  earlyMorning: 1.1, // Bonus for waking up with natural light (5:30-8:30 AM)
  consistentWakeup: 1.2, // Bonus for consistent wake-up time
};

// Helper function to convert time string to minutes since midnight
// Commented out as it's not currently used
// function timeToMinutes(timeStr: string): number {
//   const [hours, minutes] = timeStr.split(":").map(Number);
//   return hours * 60 + minutes;
// }

// Helper function to format time based on format preference (12h/24h)
function formatTime(minutes: number, format: "12h" | "24h"): string {
  // Handle minutes that go beyond 24 hours
  minutes = minutes % (24 * 60);
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (format === "24h") {
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  } else {
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${mins.toString().padStart(2, "0")} ${ampm}`;
  }
}

// Helper function to determine which sleep stage the person would be in at wake-up time
function getSleepStageDescription(wakeUpTime: number, cycles: number): string {
  // Calculate total sleep minutes
  const sleepMinutes = cycles * SLEEP_CYCLE_DURATION;
  
  // Calculate which stage of sleep the person would be in at wake-up time
  const minutesIntoLastCycle = sleepMinutes % SLEEP_CYCLE_DURATION;
  
  if (minutesIntoLastCycle <= SLEEP_STAGES.light) {
    return "Light sleep stage - Easiest to wake up";
  } else if (minutesIntoLastCycle <= SLEEP_STAGES.light + SLEEP_STAGES.deep) {
    return "Deep sleep stage - Harder to wake up";
  } else {
    return "REM sleep stage - May feel groggy";
  }
}

// Helper function to provide a visual indicator of how easy it would be to wake up
function getWakeupEaseIndicator(qualityScore: number): React.ReactElement {
  // Convert quality score to a simple indicator
  if (qualityScore >= 1.3) {
    return (
      <span className="text-green-500 font-medium">
        ★★★★★ Very easy to wake up
      </span>
    );
  } else if (qualityScore >= 1.1) {
    return (
      <span className="text-green-400 font-medium">
        ★★★★☆ Easy to wake up
      </span>
    );
  } else if (qualityScore >= 0.9) {
    return (
      <span className="text-yellow-500 font-medium">
        ★★★☆☆ Moderate
      </span>
    );
  } else if (qualityScore >= 0.7) {
    return (
      <span className="text-orange-500 font-medium">
        ★★☆☆☆ Difficult
      </span>
    );
  } else {
    return (
      <span className="text-red-500 font-medium">
        ★☆☆☆☆ Very difficult
      </span>
    );
  }
}

export default function Home() {
  const { t, timeFormat, theme } = useApp();
  const [results, setResults] = useState<Array<{time: number, hours: number, cycles: number}>>([]);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bedtime: "",
      fallAsleepTime: 15, // Default 15 minutes to fall asleep
      wakeUpTime: "",
    },
  });

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Parse the input times
    const bedtimeHour = parseInt(values.bedtime.split(":")[0]);
    const bedtimeMinute = parseInt(values.bedtime.split(":")[1]);
    const wakeUpHour = parseInt(values.wakeUpTime.split(":")[0]);
    const wakeUpMinute = parseInt(values.wakeUpTime.split(":")[1]);

    // Convert times to minutes since midnight
    const bedtimeMinutes = bedtimeHour * 60 + bedtimeMinute;
    const actualSleepStartMinutes = bedtimeMinutes + values.fallAsleepTime;
    const targetWakeUpMinutes = wakeUpHour * 60 + wakeUpMinute;

    // Calculate wake-up times based on sleep cycles
    const wakeUpTimes: Array<{time: number, hours: number, cycles: number, quality: number, recommended: boolean}> = [];
    
    // Calculate time difference (accounting for crossing midnight)
    let minutesUntilWakeUp = targetWakeUpMinutes - actualSleepStartMinutes;
    if (minutesUntilWakeUp <= 0) {
      // If wake-up time is earlier in the day than sleep time, add 24 hours
      minutesUntilWakeUp += 24 * 60;
    }

    // Find the number of complete sleep cycles that fit before the target wake-up time
    const cyclesBeforeWakeUp = Math.floor(minutesUntilWakeUp / SLEEP_CYCLE_DURATION);
    
    // Calculate how many complete cycles fit in the available time
    
    // Generate a range of wake-up times around the target time
    // We'll show options for different numbers of sleep cycles
    const cyclesToShow = [];
    
    // Show at least 5 cycles (minimum recommended sleep)
    const minCycles = Math.max(5, cyclesBeforeWakeUp - 2);
    // Show up to 7 cycles (maximum recommended sleep)
    const maxCycles = Math.min(cyclesBeforeWakeUp + 2, 7);
    
    // Generate all cycle options in the range
    for (let i = minCycles; i <= maxCycles; i++) {
      cyclesToShow.push(i);
    }
    
    // Calculate the actual wake-up times and sleep durations
    for (const cycles of cyclesToShow) {
      if (cycles <= 0) continue; // Skip if cycles is zero or negative
      
      // Calculate minutes of sleep
      const sleepMinutes = cycles * SLEEP_CYCLE_DURATION;
      
      // Calculate the wake-up time in minutes since midnight
      const wakeUpTimeMinutes = (actualSleepStartMinutes + sleepMinutes) % (24 * 60);
      
      // Calculate sleep duration in hours
      const sleepDurationHours = sleepMinutes / 60;
      
      // Calculate sleep quality score based on multiple factors
      let qualityScore = 1.0;
      
      // Factor 1: Sleep stage at wake-up time (most important factor)
      // Calculate which stage of sleep the person would be in at wake-up time
      const minutesIntoLastCycle = sleepMinutes % SLEEP_CYCLE_DURATION;
      
      if (minutesIntoLastCycle <= SLEEP_STAGES.light) {
        // Waking up during light sleep (ideal - easiest to wake up)
        qualityScore *= QUALITY_FACTORS.lightSleepWakeup;
      } else if (minutesIntoLastCycle <= SLEEP_STAGES.light + SLEEP_STAGES.deep) {
        // Waking up during deep sleep (worst - hardest to wake up)
        qualityScore *= QUALITY_FACTORS.deepSleepWakeup;
      } else {
        // Waking up during REM sleep (not ideal - may feel groggy)
        qualityScore *= QUALITY_FACTORS.remSleepWakeup;
      }
      
      // Factor 2: Complete cycle bonus (only if very close to end of cycle)
      const minutesToCycleEnd = SLEEP_CYCLE_DURATION - (minutesIntoLastCycle % SLEEP_CYCLE_DURATION);
      if (minutesToCycleEnd < 5 || minutesIntoLastCycle < 5) {
        qualityScore *= QUALITY_FACTORS.completeCycle;
      }
      
      // Factor 3: Duration-based quality
      if (sleepDurationHours < RECOMMENDED_SLEEP_RANGES.min) {
        qualityScore *= QUALITY_FACTORS.tooShort;
      } else if (sleepDurationHours > RECOMMENDED_SLEEP_RANGES.max) {
        qualityScore *= QUALITY_FACTORS.tooLong;
      } else if (
        sleepDurationHours >= RECOMMENDED_SLEEP_RANGES.min && 
        sleepDurationHours <= RECOMMENDED_SLEEP_RANGES.max
      ) {
        qualityScore *= QUALITY_FACTORS.optimalDuration;
      }
      
      // Factor 4: Early morning bonus (waking up with natural light is beneficial)
      // Convert wake-up time to hours for easier comparison
      const wakeUpHour = wakeUpTimeMinutes / 60;
      if (wakeUpHour >= 5.5 && wakeUpHour <= 8.5) {
        qualityScore *= QUALITY_FACTORS.earlyMorning;
      }
      
      // Factor 5: Proximity to target wake-up time (for consistency)
      // Calculate how close this wake-up time is to the target
      let timeDistance = Math.abs(wakeUpTimeMinutes - targetWakeUpMinutes);
      if (timeDistance > 12 * 60) { // If the difference is more than 12 hours, adjust
        timeDistance = 24 * 60 - timeDistance;
      }
      // If within 30 minutes of target time, apply consistency bonus
      if (timeDistance <= 30) {
        qualityScore *= QUALITY_FACTORS.consistentWakeup;
      }
      // Normalize to a 0-1 scale where 1 is exact match and 0 is 3+ hours away
      const proximityFactor = Math.max(0, 1 - (timeDistance / (3 * 60)));
      // Apply a small adjustment based on proximity
      qualityScore *= (0.9 + (0.2 * proximityFactor));
      
      // Determine if this is a recommended option
      const isRecommended = (
        sleepDurationHours >= RECOMMENDED_SLEEP_RANGES.min && 
        sleepDurationHours <= RECOMMENDED_SLEEP_RANGES.max
      );
      
      wakeUpTimes.push({
        time: wakeUpTimeMinutes,
        hours: sleepDurationHours,
        cycles: cycles,
        quality: parseFloat(qualityScore.toFixed(2)),
        recommended: isRecommended
      });
    }
    
    // Sort by quality score (highest first)
    wakeUpTimes.sort((a, b) => b.quality - a.quality);
    
    setResults(wakeUpTimes);
  }

  // Apply theme-specific styles
  const themeClass = theme.className;
  const isHelloKitty = theme.id === 'hello-kitty';

  // Animation for the moon/sun icon based on theme
  // Commented out as it's not currently used
  // const [moonSunPosition, setMoonSunPosition] = useState(0);
  
  useEffect(() => {
    // Animate moon/sun position when theme changes
    // setMoonSunPosition(prev => prev + 360);
  }, [theme.id]);

  return (
    <AnimatedComponent 
      animation={fadeIn} 
      className={`flex min-h-screen flex-col items-center justify-center p-4 md:p-8 ${themeClass} overflow-hidden relative`}
    >
      {/* Background decorative elements based on theme */}
      {theme.id === 'dark' && (
        <>
          <div className="absolute top-10 right-10 opacity-20">
            <AnimatedComponent animation={floating} className="text-6xl">
              ✨
            </AnimatedComponent>
          </div>
          <div className="absolute bottom-20 left-10 opacity-20">
            <AnimatedComponent animation={floating} delay={1} className="text-6xl">
              🌙
            </AnimatedComponent>
          </div>
        </>
      )}
      
      {isHelloKitty && (
        <>
          <div className="absolute top-10 left-10">
            <AnimatedComponent animation={floating} className="text-6xl">
              🎀
            </AnimatedComponent>
          </div>
          <div className="absolute bottom-20 right-10">
            <AnimatedComponent animation={floating} delay={1} className="text-6xl">
              😺
            </AnimatedComponent>
          </div>
        </>
      )}
      
      <Settings />
      
      <AnimatedComponent animation={slideInLeft} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <AnimatedComponent animation={slideUp}>
              <CardTitle className="text-2xl font-bold">
                <AnimatedText text={t("app.title")} />
              </CardTitle>
            </AnimatedComponent>
            <AnimatedComponent animation={slideUp} delay={0.1}>
              <CardDescription>
                {t("app.description")}
              </CardDescription>
            </AnimatedComponent>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <AnimatedComponent animation={slideUp} delay={0.2}>
                  <FormField
                    control={form.control}
                    name="bedtime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.bedtime.label")}</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            placeholder="e.g., 22:30"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("form.bedtime.description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AnimatedComponent>
                
                <AnimatedComponent animation={slideUp} delay={0.3}>
                  <FormField
                    control={form.control}
                    name="fallAsleepTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.fallAsleepTime.label")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 15"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("form.fallAsleepTime.description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AnimatedComponent>
                
                <AnimatedComponent animation={slideUp} delay={0.4}>
                  <FormField
                    control={form.control}
                    name="wakeUpTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.wakeUpTime.label")}</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            placeholder="e.g., 07:00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("form.wakeUpTime.description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AnimatedComponent>
                
                <AnimatedComponent animation={pulse}>
                  <Button type="submit" className="w-full">{t("form.submit")}</Button>
                </AnimatedComponent>
              </form>
            </Form>
          </CardContent>
        </Card>
      </AnimatedComponent>
      
      <AnimatePresence>
        {results.length > 0 && (
          <AnimatedComponent animation={slideInRight} className="w-full max-w-md mt-6">
            <Card>
              <CardHeader>
                <AnimatedComponent animation={slideUp}>
                  <CardTitle>{t("results.title")}</CardTitle>
                </AnimatedComponent>
                <AnimatedComponent animation={slideUp} delay={0.1}>
                  <CardDescription>
                    {t("results.description")}
                  </CardDescription>
                </AnimatedComponent>
              </CardHeader>
              <CardContent>
                <AnimatedList className="space-y-2">
                  {results.map((result: {time: number, hours: number, cycles: number, quality: number, recommended: boolean}, index: number) => (
                    <motion.li 
                      key={index} 
                      className={`p-3 ${result.recommended ? 'bg-primary/20 border border-primary/30' : 'bg-muted'} rounded-md`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-semibold">{formatTime(result.time, timeFormat)}</div>
                          <div className="text-sm">
                            {result.hours.toFixed(1)} {t("results.hours")} ({result.cycles} {t("results.cycles")})
                            {result.recommended && (
                              <span className="ml-2 text-primary">✓ {t("results.recommended")}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getSleepStageDescription(result.time, result.cycles)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {t("results.quality")}: {Math.round(result.quality * 100)}%
                          </div>
                          <div className="text-xs mt-1">
                            {getWakeupEaseIndicator(result.quality)}
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatedList>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <AnimatedComponent animation={fadeIn} delay={0.5}>
                  <p>
                    {t("results.footer")}
                  </p>
                </AnimatedComponent>
              </CardFooter>
            </Card>
          </AnimatedComponent>
        )}
      </AnimatePresence>
    </AnimatedComponent>
  );
}
