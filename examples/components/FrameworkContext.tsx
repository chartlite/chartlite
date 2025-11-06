'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type FrameworkType = 'vanilla' | 'react' | 'vue' | 'svelte' | 'angular';

interface FrameworkContextType {
  selectedFramework: FrameworkType;
  setSelectedFramework: (framework: FrameworkType) => void;
}

const FrameworkContext = createContext<FrameworkContextType | undefined>(undefined);

export function FrameworkProvider({ children }: { children: ReactNode }) {
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>('vanilla');

  return (
    <FrameworkContext.Provider value={{ selectedFramework, setSelectedFramework }}>
      {children}
    </FrameworkContext.Provider>
  );
}

export function useFramework() {
  const context = useContext(FrameworkContext);
  if (context === undefined) {
    throw new Error('useFramework must be used within a FrameworkProvider');
  }
  return context;
}
