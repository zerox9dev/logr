import { useEffect, useState } from "react";

/** The current time, refreshed once a minute — enough for anything that only
 *  needs to notice the day changing or a now-line moving. */
export function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}
