import { useState, useEffect, useCallback, useRef } from 'react';
import { scrollToElement, getHeaderHeight, prefersReducedMotion } from '@/lib/scroll';

export interface Section {
  id: string;
  label: string;
}

interface UseSectionNavigationOptions {
  sections: Section[];
  rootMargin?: string;
  threshold?: number;
  syncHash?: boolean;
}

interface UseSectionNavigationReturn {
  currentSection: string | null;
  scrollToSection: (sectionId: string) => void;
  progress: number;
}

export const useSectionNavigation = ({
  sections,
  rootMargin = '-20% 0px -70% 0px',
  threshold = 0,
  syncHash = false,
}: UseSectionNavigationOptions): UseSectionNavigationReturn => {
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);

  // Scroll to a specific section
  const scrollToSection = useCallback((sectionId: string) => {
    isScrollingRef.current = true;
    
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    scrollToElement(sectionId, { behavior, offset: 20 });
    
    // Update current section immediately for better UX
    setCurrentSection(sectionId);
    
    // Update URL hash if enabled
    if (syncHash) {
      window.history.replaceState(null, '', `#${sectionId}`);
    }

    // Reset scrolling flag after animation
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  }, [syncHash]);

  // Set up IntersectionObserver for section detection
  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setCurrentSection(sectionId);
          
          if (syncHash && sectionId) {
            window.history.replaceState(null, '', `#${sectionId}`);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold,
    });

    // Observe all sections
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections, rootMargin, threshold, syncHash]);

  // Handle initial hash navigation
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && sections.some((s) => s.id === hash)) {
      // Delay to ensure DOM is ready
      setTimeout(() => {
        scrollToSection(hash);
      }, 100);
    }
  }, [sections, scrollToSection]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setProgress((window.scrollY / scrollHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    currentSection,
    scrollToSection,
    progress,
  };
};
