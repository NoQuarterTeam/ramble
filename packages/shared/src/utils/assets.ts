export const assetUrl = "https://cdn.ramble.guide/"

export function createAssetUrl(path: string): string
export function createAssetUrl(path: string | null | undefined): string | undefined
export function createAssetUrl(path: string | null | undefined): string | undefined {
  return path ? (path.startsWith("http") || path.startsWith("file:") ? path : assetUrl + path) : undefined
}
