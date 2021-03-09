export type SafeExtract<T, U extends T> = Extract<T, U>;

export type SafeExclude<T, U extends T> = Exclude<T, U>;
