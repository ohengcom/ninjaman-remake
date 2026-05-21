export function calculateSPEarned(previousScore: number, newScore: number, interval: number): number {
    if (interval <= 0) return 0;
    const previousMilestone = Math.floor(previousScore / interval);
    const nextMilestone = Math.floor(newScore / interval);
    return Math.max(0, nextMilestone - previousMilestone);
}
