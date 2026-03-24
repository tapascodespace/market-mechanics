import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  theme: "light" | "dark";
  toggleTheme: () => void;
  hasHydrated: boolean;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      hasHydrated: false,
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        document.documentElement.setAttribute("data-theme", next);
      },
    }),
    {
      name: "reeshaw-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
          if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-theme", state.theme);
          }
        }
      },
    }
  )
);
