"use client";

import { useState, useEffect } from "react";
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
import { fadeIn, slideUp, pulse, wave, floating, slideInLeft, slideInRight } from "@/lib/animations";

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
    const earliestWakeUpMinutes = wakeUpHour * 60 + wakeUpMinute;

    // Calculate wake-up times based on sleep cycles
    const wakeUpTimes: Array<{time: number, hours: number, cycles: number}> = [];
    
    // Calculate time difference (accounting for crossing midnight)
    let minutesUntilWakeUp = earliestWakeUpMinutes - actualSleepStartMinutes;
    if (minutesUntilWakeUp <= 0) {
      // If wake-up time is earlier in the day than sleep time, add 24 hours
      minutesUntilWakeUp += 24 * 60;
    }

    // Find the number of complete sleep cycles that fit before the earliest wake-up time
    const cyclesBeforeWakeUp = Math.floor(minutesUntilWakeUp / SLEEP_CYCLE_DURATION);
    
    // Generate wake-up times around the ideal cycles
    // We'll show 4 options: 2 before and 2 after the target wake-up time
    const cyclesToShow = [];
    
    // If we have at least 3 complete cycles, show options starting from 2 cycles before
    if (cyclesBeforeWakeUp >= 3) {
      cyclesToShow.push(cyclesBeforeWakeUp - 2);
    }
    
    // If we have at least 2 complete cycles, show options starting from 1 cycle before
    if (cyclesBeforeWakeUp >= 2) {
      cyclesToShow.push(cyclesBeforeWakeUp - 1);
    }
    
    // Always show the closest cycle to the target wake-up time
    cyclesToShow.push(cyclesBeforeWakeUp);
    
    // Show one cycle after
    cyclesToShow.push(cyclesBeforeWakeUp + 1);
    
    // Calculate the actual wake-up times and sleep durations
    for (const cycles of cyclesToShow) {
      if (cycles <= 0) continue; // Skip if cycles is zero or negative
      
      // Calculate minutes of sleep
      const sleepMinutes = cycles * SLEEP_CYCLE_DURATION;
      
      // Calculate the wake-up time in minutes since midnight
      const wakeUpTimeMinutes = (actualSleepStartMinutes + sleepMinutes) % (24 * 60);
      
      // Calculate sleep duration in hours (always based on actual cycles, not clock time)
      const sleepDurationHours = sleepMinutes / 60;
      
      wakeUpTimes.push({
        time: wakeUpTimeMinutes,
        hours: sleepDurationHours,
        cycles: cycles
      });
    }
    
    // Sort by wake-up time
    wakeUpTimes.sort((a, b) => {
      // If times cross midnight, adjust for proper sorting
      let timeA = a.time;
      let timeB = b.time;
      
      // If one time is before midnight and one is after, adjust for comparison
      if (timeA < actualSleepStartMinutes && timeB > actualSleepStartMinutes) {
        timeA += 24 * 60;
      } else if (timeB < actualSleepStartMinutes && timeA > actualSleepStartMinutes) {
        timeB += 24 * 60;
      }
      
      return timeA - timeB;
    });
    
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
                  {results.map((result: {time: number, hours: number, cycles: number}, index: number) => (
                    <motion.li 
                      key={index} 
                      className="p-3 bg-muted rounded-md"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <AnimatedComponent animation={wave}>
                        {formatTime(result.time, timeFormat)} ({result.hours.toFixed(1)} {t("results.hours")}, {result.cycles} {t("results.cycles")})
                      </AnimatedComponent>
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
