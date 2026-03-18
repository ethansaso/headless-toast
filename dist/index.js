import { create } from "zustand";
/**
 * Factory to create a typed toast system.
 */
export function createToastSystem(config) {
    const activeTimers = new Map();
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
    const useToastStore = create((set, get) => ({
        toasts: [],
        add: (input) => {
            const id = crypto.randomUUID();
            const resolved = resolveDefaults(input);
            const item = { id, ...resolved };
            set((s) => ({ toasts: [...s.toasts, item] }));
            if (resolved.duration > 0 && resolved.duration !== Infinity) {
                const timer = setTimeout(() => {
                    get().remove(id);
                }, resolved.duration);
                activeTimers.set(id, timer);
            }
            return id;
        },
        remove: (id) => {
            const timer = activeTimers.get(id);
            if (timer) {
                clearTimeout(timer);
                activeTimers.delete(id);
            }
            set((s) => ({
                toasts: s.toasts.filter((t) => t.id !== id),
            }));
        },
        clear: () => {
            activeTimers.forEach((timer) => clearTimeout(timer));
            activeTimers.clear();
            set({ toasts: [] });
        },
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
