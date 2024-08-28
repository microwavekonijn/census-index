export type RecordValue<R> = R extends Record<any, infer T> ? T : never;

export type ArrayValue<A> = A extends (infer T)[] ? T : never;