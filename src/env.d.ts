/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** "formspree" (standard) eller "netlify" */
  readonly PUBLIC_FORM_PROVIDER?: string;
  /** Formspree-endpoint, t.ex. https://formspree.io/f/abcdwxyz */
  readonly PUBLIC_FORMSPREE_ENDPOINT?: string;
  /** Extern bokningslänk (Bokadirekt, Calendly m.fl.). Tom = eget formulär. */
  readonly PUBLIC_BOOKING_URL?: string;
}
