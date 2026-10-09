import { load } from 'js-yaml';
import foretagRaw from '../data/foretag.yaml?raw';
import tjansterRaw from '../data/tjanster.yaml?raw';

export type SizeId = string;
export type PriceMap = Record<SizeId, number | null>;

export interface Size { id: SizeId; namn: string; exempel: string }
export interface Package {
  id: string; namn: string; kort: string; utvald: boolean; tid: string;
  ingar: string[]; priser: PriceMap;
}
export interface Addon {
  id: string; namn: string; beskrivning: string; tid: string;
  priser?: PriceMap; pris?: number | null;
}

export const foretag = load(foretagRaw) as any;
export const tjanster = load(tjansterRaw) as {
  storlekar: Size[]; paket: Package[]; tillval: Addon[];
};

/** Sant om värdet är ifyllt (inte tomt och inte en "[FYLL I"-platshållare). */
export const isFilled = (v: unknown): v is string | number =>
  v !== null && v !== undefined && String(v).trim() !== '' && !String(v).startsWith('[FYLL I');

export const ort: string = foretag.ort;

const kr = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 });
export const formatPrice = (n: number | null | undefined) =>
  isFilled(n) ? `${kr.format(Number(n))} kr` : '[FYLL I: pris]';

/** Lägsta ifyllda pris i en prislista, eller null. */
export function fromPrice(priser?: PriceMap | null, pris?: number | null): number | null {
  const vals = [pris, ...Object.values(priser ?? {})].filter(isFilled).map(Number);
  return vals.length ? Math.min(...vals) : null;
}

/** "Boka tid" leder till extern bokningstjänst om den är konfigurerad, annars till /boka/. */
export const bookingUrl: string = import.meta.env.PUBLIC_BOOKING_URL || '/boka/';
export const bookingIsExternal = /^https?:\/\//.test(bookingUrl);

/** Klickbar telefonlänk – bara om ett riktigt nummer finns. */
export const phone = {
  display: foretag.kontakt.telefon as string,
  href: isFilled(foretag.kontakt.telefon_e164)
    ? `tel:${foretag.kontakt.telefon_e164}`
    : isFilled(foretag.kontakt.telefon)
      ? `tel:${String(foretag.kontakt.telefon).replace(/[^\d+]/g, '')}`
      : null,
};

export const socials = Object.entries(foretag.sociala_medier ?? {})
  .filter(([, url]) => isFilled(url))
  .map(([name, url]) => ({ name, url: url as string }));

export const nav = [
  { href: '/tjanster/', label: 'Tjänster & priser' },
  { href: '/galleri/', label: 'Galleri' },
  { href: '/om-oss/', label: 'Om oss' },
  { href: '/vanliga-fragor/', label: 'Vanliga frågor' },
  { href: '/boka/', label: 'Kontakt' },
];
