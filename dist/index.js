import { create } from "zustand";
/**
 * Factory to create a typed toast system.
 */
export function createToastSystem(config) {
    function resolveDefaults(input) {
        const variant = input.variant ?? config.variants[0];
        const title = input.title ?? config.getDefaultTitle?.(variant) ?? "Notification";
        return {
            title,
            description: input.description,
            duration: input.duration ?? config.defaultDuration ?? 5000,
            variant,
        };
    }
    const useToastStore = create((set) => ({
        toasts: [],
        add: (input) => {
            const id = crypto.randomUUID();
            const item = { id, ...resolveDefaults(input) };
            set((s) => ({ toasts: [...s.toasts, item] }));
            return id;
        },
        remove: (id) => set((s) => ({
            toasts: s.toasts.filter((t) => t.id !== id),
        })),
        clear: () => set({ toasts: [] }),
    }));
    /** Adds a toast notification. */
    function toast(input) {
        return useToastStore.getState().add(input);
    }
    return {
        toast,
        useToastStore,
    };
}
