export type TableParams<T> = { page?: string; search?: string; sort?: "asc" | "desc"; sortBy?: keyof T }
