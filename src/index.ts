import type { StoreApi, UseBoundStore } from "zustand";
import { create } from "zustand";

/**
 * Configuration for the toast system.
 * Generically typed for custom variants.
 */
export type ToastConfig<TVariant extends string> = {
  variants: readonly [TVariant, ...TVariant[]];
  defaultDuration?: number;
  getDefaultTitle?: (variant: TVariant) => string;
};

/**
 * Internal toast shape.
 */
export type ToastItem<TVariant extends string> = {
  id: string;
  title: string;
  description?: string;
  duration: number;
  variant: TVariant;
};

/**
 * Input when creating a toast.
 */
export type ToastInput<TVariant extends string> = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: TVariant;
};

/**
 * Internal store shape.
 */
type ToastStoreState<TVariant extends string> = {
  toasts: ToastItem<TVariant>[];
  add: (input: ToastInput<TVariant>) => string;
  remove: (id: string) => void;
  clear: () => void;
};

/**
 * Generic Zustand store type. Takes variant typing from the factory config.
 */
export type ToastStore<TVariant extends string> = UseBoundStore<
  StoreApi<ToastStoreState<TVariant>>
>;

/**
 * Public API returned from the factory.
 */
export type ToastSystem<TVariant extends string> = {
  toast: (input: ToastInput<TVariant>) => string;
  useToastStore: ToastStore<TVariant>;
};

/**
 * Factory to create a typed toast system.
 */
export function createToastSystem<const TVariant extends string>(
  config: ToastConfig<TVariant>,
): ToastSystem<TVariant> {
  type Variant = TVariant;
  type Item = ToastItem<Variant>;
  type Input = ToastInput<Variant>;
  type State = ToastStoreState<Variant>;

  const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

  function resolveDefaults(input: Input): Omit<Item, "id"> {
    const variant = input.variant ?? config.variants[0];
    const title = input.title ?? config.getDefaultTitle?.(variant) ?? "Notification";

    return {
      title,
      description: input.description,
      duration: input.duration ?? config.defaultDuration ?? 5000,
      variant,
    };
  }

  const useToastStore: ToastStore<Variant> = create<State>((set, get) => ({
    toasts: [],

    add: (input) => {
      const id = crypto.randomUUID();
      const resolved = resolveDefaults(input);
      const item: Item = { id, ...resolved };

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
  function toast(input: Input) {
    return useToastStore.getState().add(input);
  }

  return {
    toast,
    useToastStore,
  };
}
