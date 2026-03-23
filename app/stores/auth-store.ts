import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/app/lib/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  users: Record<string, { user: User; password: string }>;
  setHasHydrated: (v: boolean) => void;
  login: (email: string, password: string) => boolean;
  register: (email: string, name: string, password: string) => boolean;
  logout: () => void;
  updateBalance: (amount: number) => void;
  updateLockedMargin: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      users: {},

      setHasHydrated: (v) => set({ hasHydrated: v }),

      register: (email, name, password) => {
        const { users } = get();
        if (users[email]) return false;

        const user: User = {
          id: `user-${Date.now()}`,
          email,
          name,
          balance: 100_000,
          lockedMargin: 0,
          totalEquity: 100_000,
        };

        set({
          users: { ...users, [email]: { user, password } },
          user,
          isAuthenticated: true,
        });
        return true;
      },

      login: (email, password) => {
        const { users } = get();
        const entry = users[email];
        if (!entry || entry.password !== password) return false;

        set({ user: entry.user, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateBalance: (amount) => {
        const { user, users } = get();
        if (!user) return;
        const newBalance = user.balance + amount;
        const updatedUser = {
          ...user,
          balance: newBalance,
          totalEquity: newBalance + user.lockedMargin,
        };
        const updatedUsers = {
          ...users,
          [user.email]: { ...users[user.email], user: updatedUser },
        };
        set({ user: updatedUser, users: updatedUsers });
      },

      updateLockedMargin: (amount) => {
        const { user, users } = get();
        if (!user) return;
        const newLockedMargin = user.lockedMargin + amount;
        const updatedUser = {
          ...user,
          lockedMargin: newLockedMargin,
          totalEquity: user.balance + newLockedMargin,
        };
        const updatedUsers = {
          ...users,
          [user.email]: { ...users[user.email], user: updatedUser },
        };
        set({ user: updatedUser, users: updatedUsers });
      },
    }),
    {
      name: "reeshaw-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
