"use client";

import { useEffect, useRef, useCallback } from "react";

/** Keeps the screen on while `active` is true — used during a live ride so
 * the tracking map doesn't lock the phone mid-journey. */
export function useWakeLock(active: boolean): { isSupported: boolean } {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isSupported = typeof window !== "undefined" && "wakeLock" in navigator;

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return;
    if (wakeLockRef.current && !wakeLockRef.current.released) return;
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      wakeLockRef.current = sentinel;
      sentinel.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
    } catch (err) {
      console.warn("Wake lock request failed:", err);
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.warn("Wake lock release failed:", err);
      } finally {
        wakeLockRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (active) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [active, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    if (!isSupported) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && active) {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isSupported, active, requestWakeLock]);

  return { isSupported };
}
