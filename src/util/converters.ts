export function secondsToFormattedString(seconds: number): string {
    let secs: number = seconds % 60;
    let mins: number = Math.floor(seconds / 60);
    if (secs < 10) return mins + ":0" + secs;
    return mins + ":" + secs;
}

export function formattedStringToSeconds(time: string): number {
    let splits = time.split(":");
    let mins = splits[0];
    let secs = splits[1];
    return Number.parseInt(mins) * 60 + Number.parseInt(secs);
}

export function secondsToFrame(seconds: number, framerate: number): number {
    return seconds * framerate;
}