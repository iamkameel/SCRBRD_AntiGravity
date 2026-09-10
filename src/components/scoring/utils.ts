export function fmtOv(balls: number): string { return `${Math.floor(balls / 6)}.${balls % 6}`; }

export function crrVal(runs: number, balls: number): number { return balls > 0 ? (runs / balls) * 6 : 0; }

export function crrStr(runs: number, balls: number): string { return crrVal(runs, balls).toFixed(2); }

export function rrrStr(target: number | undefined, runs: number, balls: number, maxBalls: number): string | null {
    if (!target) return null;
    const rem = target - runs; const remB = maxBalls - balls;
    if (remB <= 0) return '—';
    return ((rem / remB) * 6).toFixed(2);
}

export const SR = (r: number, b: number) => b === 0 ? '—' : ((r / b) * 100).toFixed(1);

export const Econ = (r: number, b: number) => b === 0 ? '—' : ((r / (b / 6))).toFixed(2);

export function getPlayerName(players: any[], id: string | null | undefined): string {
    if (!id) return '—';
    const p = players.find(x => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : id.slice(0, 8);
}
