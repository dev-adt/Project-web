import { create } from 'zustand';

export interface Section {
  id: string;
  sectionType: string;
  position: number;
  settingsJson: any;
  isActive: boolean;
}

interface BuilderState {
  pageId: string | null;
  pageTitle: string;
  sections: Section[];
  selectedSectionId: string | null;
  responsiveMode: 'desktop' | 'tablet' | 'mobile';
  saving: boolean;
  history: Section[][];
  historyIndex: number;

  // Actions
  setPageId: (pageId: string) => void;
  loadPage: (pageId: string) => Promise<void>;
  saveLayout: () => Promise<void>;
  addSection: (sectionType: string, defaultSettings: any) => void;
  removeSection: (id: string) => void;
  updateSectionSettings: (id: string, settings: any) => void;
  reorderSections: (sectionIds: string[]) => void;
  selectSection: (id: string | null) => void;
  setResponsiveMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  undo: () => void;
  redo: () => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => {
  const pushToHistory = (newSections: Section[]) => {
    const { history, historyIndex } = get();
    const cleanHistory = history.slice(0, historyIndex + 1);
    set({
      history: [...cleanHistory, newSections],
      historyIndex: cleanHistory.length,
      sections: newSections,
    });
  };

  return {
    pageId: null,
    pageTitle: 'Loading Page Layout...',
    sections: [],
    selectedSectionId: null,
    responsiveMode: 'desktop',
    saving: false,
    history: [[]],
    historyIndex: 0,

    setPageId: (pageId) => set({ pageId }),

    loadPage: async (pageId) => {
      try {
        set({ saving: true });
        // Retrieve page settings first
        const pageRes = await fetch(`/api/v1/pages/${pageId}`);
        if (!pageRes.ok) throw new Error('Failed to retrieve page metadata.');
        const pageData = await pageRes.json();

        // Retrieve sections layout
        const layoutRes = await fetch(`/api/v1/pages/${pageId}/layout`);
        if (!layoutRes.ok) throw new Error('Failed to retrieve page layout.');
        const layoutData = await layoutRes.json();

        const loadedSections = layoutData.data?.sections || [];

        set({
          pageId,
          pageTitle: pageData.data?.title || 'Landing Page',
          sections: loadedSections,
          history: [loadedSections],
          historyIndex: 0,
          saving: false,
        });
      } catch (err) {
        console.error('Error loading page workspace:', err);
        set({ saving: false });
      }
    },

    saveLayout: async () => {
      const { pageId, sections } = get();
      if (!pageId) return;

      try {
        set({ saving: true });
        const res = await fetch(`/api/v1/pages/${pageId}/layout`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sections: sections.map((sec, idx) => ({
              sectionType: sec.sectionType,
              position: idx,
              settingsJson: sec.settingsJson,
              isActive: sec.isActive,
            })),
          }),
        });

        if (!res.ok) throw new Error('Failed to sync layout with database API.');
        
        set({ saving: false });
      } catch (err) {
        console.error('Error syncing layout with database API:', err);
        set({ saving: false });
      }
    },

    addSection: (sectionType, defaultSettings) => {
      const { sections } = get();
      const newSection: Section = {
        id: `temp-${Date.now()}`,
        sectionType,
        position: sections.length,
        settingsJson: defaultSettings || {},
        isActive: true,
      };

      const newSections = [...sections, newSection];
      pushToHistory(newSections);
      set({ selectedSectionId: newSection.id });
    },

    removeSection: (id) => {
      const { sections, selectedSectionId } = get();
      const newSections = sections
        .filter((sec) => sec.id !== id)
        .map((sec, idx) => ({ ...sec, position: idx }));

      pushToHistory(newSections);
      set({
        selectedSectionId: selectedSectionId === id ? null : selectedSectionId,
      });
    },

    updateSectionSettings: (id, settings) => {
      const { sections } = get();
      const newSections = sections.map((sec) => {
        if (sec.id === id) {
          return {
            ...sec,
            settingsJson: {
              ...sec.settingsJson,
              ...settings,
            },
          };
        }
        return sec;
      });

      pushToHistory(newSections);
    },

    reorderSections: (sectionIds) => {
      const { sections } = get();
      const reordered = sectionIds.map((id, index) => {
        const original = sections.find((sec) => sec.id === id);
        return {
          ...original!,
          position: index,
        };
      });

      pushToHistory(reordered);
    },

    selectSection: (id) => set({ selectedSectionId: id }),

    setResponsiveMode: (mode) => set({ responsiveMode: mode }),

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        set({
          historyIndex: nextIdx,
          sections: history[nextIdx],
          selectedSectionId: null,
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        set({
          historyIndex: nextIdx,
          sections: history[nextIdx],
          selectedSectionId: null,
        });
      }
    },
  };
});
