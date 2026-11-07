"use client";

import { useEffect, useState } from "react";
import { sameDay } from "./date";

/** Today's date, as the BROWSER reckons it. */
export function useToday(serverNow: number): Date {
  const [today, setToday] = useState<Date>(() => new Date(serverNow));

  useEffect(() => {
    const now = new Date();
    setToday((prev) => (sameDay(prev, now) ? prev : now));
  }, []);

  return today;
}
