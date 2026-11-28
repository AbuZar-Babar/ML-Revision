'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export type AppView = 'overview' | 'stage' | 'compare' | 'glossary' | 'labs';
export type StageSection = 'concept' | 'lab' | 'code';
export type ThemeMode = 'light' | 'dark';

export const TOTAL_CHAPTERS = 17;

export const STAGE_SECTIONS: { id: StageSection; num: string; label: string }[] =
  [
    { id: 'concept', num: '01', label: 'Concept & Formula' },
    { id: 'lab', num: '02', label: 'Visual Lab' },
    { id: 'code', num: '03', label: 'Python Code' },
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
  completedChapters: number[];
  markChapterCompleted: (chapterId: number) => void;
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

const THEME_STORAGE_KEY = 'ml-studio-lab-theme';
const PROGRESS_STORAGE_KEY = 'ml-studio-lab-completed-v3';
const LAST_CHAPTER_STORAGE_KEY = 'ml-studio-lab-last-chapter-v3';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<AppView>('overview');
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [activeSection, setActiveSection] = useState<StageSection>('concept');
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [teacherDrawerOpen, setTeacherDrawerOpen] = useState<boolean>(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState<boolean>(false);

  const proofHandlersRef = useRef<Map<number, () => void>>(new Map());
  const pendingProofStageRef = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme);
        }
        const savedProgress = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (n): n is number =>
                typeof n === 'number' && n >= 1 && n <= TOTAL_CHAPTERS
            );
            setCompletedChapters(Array.from(new Set(valid)));
          }
        }
        const savedChapter = window.localStorage.getItem(
          LAST_CHAPTER_STORAGE_KEY
        );
        if (savedChapter) {
          const ch = Number(savedChapter);
          if (Number.isInteger(ch) && ch >= 1 && ch <= TOTAL_CHAPTERS) {
            setActiveStageId(ch);
          }
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
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
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

  const markChapterCompleted = useCallback((chapterId: number) => {
    setCompletedChapters((prev) => {
      if (prev.includes(chapterId)) return prev;
      const next = [...prev, chapterId].sort((a, b) => a - b);
      try {
        window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const openStage = useCallback(
    (stageId: number, initialSection: StageSection = 'concept') => {
      const clamped = Math.max(1, Math.min(TOTAL_CHAPTERS, stageId));
      setActiveStageId(clamped);
      setActiveSection(initialSection);
      setView('stage');
      try {
        window.localStorage.setItem(LAST_CHAPTER_STORAGE_KEY, String(clamped));
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  const nextStage = useCallback(() => {
    setActiveStageId((prev) => {
      if (prev >= TOTAL_CHAPTERS) {
        setView('labs');
        return TOTAL_CHAPTERS;
      }
      const next = prev + 1;
      setActiveSection('concept');
      try {
        window.localStorage.setItem(LAST_CHAPTER_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return next;
    });
  }, []);

  const prevStage = useCallback(() => {
    setActiveStageId((prev) => {
      const next = Math.max(1, prev - 1);
      setActiveSection('concept');
      try {
        window.localStorage.setItem(LAST_CHAPTER_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
        completedChapters,
        markChapterCompleted,
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
