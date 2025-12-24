import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CursorContextType {
  cursorEnabled: boolean;
  setCursorEnabled: (enabled: boolean) => void;
  toggleCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
}

interface CursorProviderProps {
  children: ReactNode;
}

export function CursorProvider({ children }: CursorProviderProps) {
  const [cursorEnabled, setCursorEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('healing-buds-cursor');
      return stored !== 'disabled';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('healing-buds-cursor', cursorEnabled ? 'enabled' : 'disabled');
  }, [cursorEnabled]);

  const toggleCursor = () => setCursorEnabled(prev => !prev);

  return (
    <CursorContext.Provider value={{ cursorEnabled, setCursorEnabled, toggleCursor }}>
      {children}
    </CursorContext.Provider>
  );
}
