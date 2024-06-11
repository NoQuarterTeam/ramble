import type * as FileSystem from "expo-file-system"

export const TEN_MB = 10 * 1024 * 1024
export type FileInfo = FileSystem.FileInfo & { size?: number }
