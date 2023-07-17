export function GenerateToken(id: string, vendor: string) {
    return "YT/XK1ctsfM7FI~" + require('./Cryptr').encrypt(id + "~" + vendor);
}