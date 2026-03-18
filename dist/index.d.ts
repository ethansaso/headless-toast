import type { StoreApi, UseBoundStore } from "zustand";
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
export type ToastStore<TVariant extends string> = UseBoundStore<StoreApi<ToastStoreState<TVariant>>>;
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
export declare function createToastSystem<const TVariant extends string>(config: ToastConfig<TVariant>): ToastSystem<TVariant>;
export {};
