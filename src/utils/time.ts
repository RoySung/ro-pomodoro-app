export const sec2ms = (s: number) => s * 1000
export const minu2ms = (m: number) => sec2ms(m * 60)
export const ms2sec = (ms: number) => Math.floor(ms / 1000)
export const ms2minu = (ms: number) => Math.floor(ms2sec(ms) / 60)
