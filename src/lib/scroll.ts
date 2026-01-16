/**
 * Shared scroll utilities for smooth navigation
 */

/**
 * Get current header height based on scroll state
 * Header is taller when at top, shorter when scrolled
 */
export const getHeaderHeight = (): number => {
  const scrolled = window.scrollY > 50;
  return scrolled ? 64 : 80;
};

/**
 * Smooth scroll to an element by ID with header offset
 */
export const scrollToElement = (
  elementId: string,
  options?: {
    offset?: number;
    behavior?: ScrollBehavior;
  }
): void => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const headerHeight = getHeaderHeight();
  const additionalOffset = options?.offset ?? 0;
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - headerHeight - additionalOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: options?.behavior ?? 'smooth',
  });
};

/**
 * Smooth scroll to top of page
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth'): void => {
  window.scrollTo({
    top: 0,
    behavior,
  });
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get scroll progress as a percentage (0-100)
 */
export const getScrollProgress = (containerRef?: React.RefObject<HTMLElement>): number => {
  if (containerRef?.current) {
    const container = containerRef.current;
    const containerTop = container.offsetTop;
    const containerHeight = container.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Calculate progress within the container
    const startScroll = containerTop - viewportHeight;
    const endScroll = containerTop + containerHeight;
    const totalScrollDistance = endScroll - startScroll;
    const currentProgress = scrollY - startScroll;

    return Math.min(100, Math.max(0, (currentProgress / totalScrollDistance) * 100));
  }

  // Default: full document progress
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return 0;
  return Math.min(100, Math.max(0, (window.scrollY / scrollHeight) * 100));
};
