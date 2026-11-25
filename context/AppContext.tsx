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
export type StageSection = 'idea' | 'formula' | 'example' | 'lab';
export type ThemeMode = 'light' | 'dark';

export const STAGE_SECTIONS: { id: StageSection; num: string; label: string }[] =
  [
    { id: 'idea', num: '01', label: 'Idea' },
    { id: 'formula', num: '02', label: 'Formula' },
    { id: 'example', num: '03', label: 'Example' },
    { id: 'lab', num: '04', label: 'Lab' },
  ];

interface AppContextValue {
  view: AppView;
  setView: (view: AppView) => void;
  activeStageId: number;
  activeSection: StageSection;
  setActiveSection: (section: StageSection) => void;
  nextSection: () => void;
  prevSection: () => void;
  openStage: (stageId: number, initialSection?: StageSection) => void;
  nextStage: () => void;
  prevStage: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
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
  const [activeSection, setActiveSection] = useState<StageSection>('idea');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
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

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // Always opens Section 01 (Idea) by default when entering a stage
  const openStage = useCallback(
    (stageId: number, initialSection: StageSection = 'idea') => {
      const clamped = Math.max(1, Math.min(7, stageId));
      setActiveStageId(clamped);
      setActiveSection(initialSection);
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
      setActiveSection('idea');
      return prev + 1;
    });
  }, []);

  const prevStage = useCallback(() => {
    setActiveStageId((prev) => {
      const next = Math.max(1, prev - 1);
      setActiveSection('idea');
      return next;
    });
  }, []);

  const nextSection = useCallback(() => {
    setActiveSection((prev) => {
      const idx = STAGE_SECTIONS.findIndex((s) => s.id === prev);
      if (idx < STAGE_SECTIONS.length - 1) {
        return STAGE_SECTIONS[idx + 1].id;
      }
      return prev;
    });
  }, []);

  const prevSection = useCallback(() => {
    setActiveSection((prev) => {
      const idx = STAGE_SECTIONS.findIndex((s) => s.id === prev);
      if (idx > 0) {
        return STAGE_SECTIONS[idx - 1].id;
      }
      return prev;
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

      // If Teacher Mode triggered a visual proof while on Idea/Formula/Example, run it cleanly now that Lab mounted
      if (pendingProofStageRef.current === stageId) {
        pendingProofStageRef.current = null;
        window.setTimeout(() => {
          handler();
        }, 160);
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
      // Visual Lab isn't mounted yet: jump straight to Section 04 (Lab) & queue the proof
      pendingProofStageRef.current = stageId;
      setActiveSection('lab');
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        activeStageId,
        activeSection,
        setActiveSection,
        nextSection,
        prevSection,
        openStage,
        nextStage,
        prevStage,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
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
