/**
 * Formats a duration in seconds into a string format (e.g. HH:MM:SS or MM:SS)
 * @param seconds Duration in seconds
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const paddedMins = mins.toString().padStart(2, "0");
  const paddedSecs = secs.toString().padStart(2, "0");
  
  if (hrs > 0) {
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  
  // Return single digit minutes if < 10 for simplicity (e.g. 1:15 instead of 01:15)
  return `${mins}:${paddedSecs}`;
}

/**
 * Formats duration in minutes to hours and minutes (e.g. 134 -> "2h 14m")
 * @param minutes Duration in minutes
 */
export function formatMovieTime(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) return "0m";
  
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  
  return `${mins}m`;
}
