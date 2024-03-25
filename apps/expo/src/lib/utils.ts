// Turns a number of seconds into format M:SS, MM:SS, H:MM:SS, etc (e.g. 0:03, 12:05, 1:03:47)
export const formatVideoDuration = (duration: number) => {
  const tenMinutes = 60 * 10
  const oneHour = 60 * 60
  const tenHours = oneHour * 10
  return new Date(duration * 1000)
    .toISOString()
    .slice(duration >= tenHours ? 11 : duration >= oneHour ? 12 : duration >= tenMinutes ? 14 : 15, 19)
}
