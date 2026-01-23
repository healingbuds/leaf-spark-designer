import { useRef, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

/**
 * Smart auto-focus hook that only triggers on desktop devices.
 * Mobile-first: prevents unwanted keyboard popup on touch devices.
 * 
 * @param shouldFocus - Whether to attempt focus (default: true)
 * @param delay - Delay in ms before focusing (default: 150, allows animations to settle)
 * @returns ref to attach to the input element
 */
export function useAutoFocus<T extends HTMLElement = HTMLInputElement>(
  shouldFocus: boolean = true,
  delay: number = 150
) {
  const ref = useRef<T>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Mobile-first: only auto-focus on desktop to avoid keyboard popup
    if (!shouldFocus || isMobile) return;

    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        // Scroll into view if needed, with smooth behavior
        ref.current.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [shouldFocus, isMobile, delay]);

  return ref;
}

/**
 * Hook for managing focus on step transitions.
 * Focuses the first interactive element in a step after animation completes.
 * 
 * @param step - Current step number
 * @param containerSelector - CSS selector for the step container
 */
export function useStepFocus(step: number, containerSelector: string = '[data-step="active"]') {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Mobile-first: skip auto-focus on touch devices
    if (isMobile) return;

    const timer = setTimeout(() => {
      const container = document.querySelector(containerSelector);
      if (!container) return;

      // Priority order: input > button with role="radio" > button
      const firstInteractive = container.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), ' +
        'button[role="radio"]:not([disabled]), ' +
        'button:not([disabled])'
      );

      if (firstInteractive) {
        firstInteractive.focus();
      }
    }, 300); // After framer-motion animation

    return () => clearTimeout(timer);
  }, [step, containerSelector, isMobile]);
}
