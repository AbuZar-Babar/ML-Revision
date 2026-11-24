'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export type AppView = 'overview' | 'stage' | 'labs' | 'guide';
export type StageStep = 'concept' | 'visual';
export type ThemeMode = 'light' | 'dark';

interface AppContextValue {
  view: AppView;
  setView: (view: AppView) => void;
  activeStageId: number;
  stageStep: StageStep;
  setStageStep: (step: StageStep) => void;
  openStage: (stageId: number, initialStep?: StageStep) => void;
  nextStage: () => void;
  prevStage: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  teacherDrawerOpen: boolean;
  setTeacherDrawerOpen: (open: boolean) => void;
  toggleTeacherDrawer: () => void;
  cheatSheetOpen: boolean;
  setCheatSheetOpen: (open: boolean) => void;
  toggleCheatSheet: () => void;
  registerProofHandler: (stageId: number, handler: () => void) => () => void;
  triggerVisualProof: (stageId: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<AppView>('overview');
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [stageStep, setStageStep] = useState<StageStep>('concept');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [teacherDrawerOpen, setTeacherDrawerOpen] = useState<boolean>(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState<boolean>(false);

  const proofHandlersRef = useRef<Map<number, () => void>>(new Map());
  const pendingProofStageRef = useRef<number | null>(null);

  // Restore saved theme asynchronously to avoid synchronous setState in effect
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem('ml-studio-lab-theme');
        if (saved === 'dark' || saved === 'light') {
          setTheme(saved);
        }
      } catch {
        // ignore storage restrictions
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('ml-studio-lab-theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Always opens Step 1 (Concept & Formulas) by default when entering a stage
  const openStage = useCallback(
    (stageId: number, initialStep: StageStep = 'concept') => {
      const clamped = Math.max(1, Math.min(7, stageId));
      setActiveStageId(clamped);
      setStageStep(initialStep);
      setView('stage');
    },
    []
  );

  const nextStage = useCallback(() => {
    setActiveStageId((prev) => {
      if (prev >= 7) {
        setView('labs');
        return 7;
      }
      setStageStep('concept');
      return prev + 1;
    });
  }, []);

  const prevStage = useCallback(() => {
    setActiveStageId((prev) => {
      const next = Math.max(1, prev - 1);
      setStageStep('concept');
      return next;
    });
  }, []);

  const toggleTeacherDrawer = useCallback(() => {
    setTeacherDrawerOpen((prev) => !prev);
  }, []);

  const toggleCheatSheet = useCallback(() => {
    setCheatSheetOpen((prev) => !prev);
  }, []);

  const registerProofHandler = useCallback(
    (stageId: number, handler: () => void) => {
      proofHandlersRef.current.set(stageId, handler);

      // If Teacher Mode triggered a visual proof while on Step 1 (Concept), run it cleanly now that Visual Lab mounted
      if (pendingProofStageRef.current === stageId) {
        pendingProofStageRef.current = null;
        window.setTimeout(() => {
          handler();
        }, 140);
      }

      return () => {
        if (proofHandlersRef.current.get(stageId) === handler) {
          proofHandlersRef.current.delete(stageId);
        }
      };
    },
    []
  );

  const triggerVisualProof = useCallback((stageId: number) => {
    const fn = proofHandlersRef.current.get(stageId);
    if (fn) {
      fn();
    } else {
      // Stage Visual Lab isn't mounted yet (user is on Concept & Formulas step): switch to Visual Lab & queue proof
      pendingProofStageRef.current = stageId;
      setStageStep('visual');
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        activeStageId,
        stageStep,
        setStageStep,
        openStage,
        nextStage,
        prevStage,
        theme,
        toggleTheme,
        teacherDrawerOpen,
        setTeacherDrawerOpen,
        toggleTeacherDrawer,
        cheatSheetOpen,
        setCheatSheetOpen,
        toggleCheatSheet,
        registerProofHandler,
        triggerVisualProof,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
