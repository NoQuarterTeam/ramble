import type * as FileSystem from "expo-file-system"

// export const TEN_MB = 10 * 1024 * 1024
export const TEN_MB = 1 * 1024 * 1024 // TESTINGGGGG
export type FileInfo = FileSystem.FileInfo & { size?: number }
