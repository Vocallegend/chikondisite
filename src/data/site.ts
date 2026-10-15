/**
 * Site-wide configuration.
 *
 * This is the single place to change the product name, navigation, footer links
 * and the Android facts shown around the site. Everything here is either taken
 * from the real Chikondi Android project or intentionally left empty so the UI
 * can say "not available" instead of inventing a value.
 *
 * Company / studio details are deliberately blank. Fill them in when the real
 * legal entity exists — never before.
 */

export const site = {
  name: "Chikondi",
  /** Used in the <title> suffix and the footer. */
  shortName: "Chikondi",
  tagline: "Real Connections Start with Chikondi.",
  description:
    "Discover people, make meaningful connections, and explore new possibilities with Chikondi.",
  /** The real Android application id (capacitor.config.ts / build.gradle). */
  packageId: "zm.chikondi.app",
  android: {
    /** minSdkVersion from android/variables.gradle. */
    minApi: 24,
    minVersion: "7.0",
    format: "Android APK",
  },
  /**
   * Optional real company/studio details. Empty by default. The About page
   * renders them only when set, so nothing is fabricated.
   */
  company: {
    legalName: "",
    address: "",
    contactEmail: "",
  },
  /** Real social profiles only. Empty by default; the footer hides the row. */
  social: [] as { label: string; href: string }[],
} as const;

export type NavItem = { label: string; to: string };

/** Desktop + mobile primary navigation. The Download action is rendered apart. */
export const primaryNav: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Safety", to: "/safety" },
  { label: "About", to: "/about" },
  { label: "Help", to: "/help" },
];

export const footerColumns: { title: string; links: NavItem[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "Features", to: "/features" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "About Chikondi", to: "/about" },
    ],
  },
  {
    title: "Get the app",
    links: [
      { label: "Download Chikondi", to: "/download" },
      { label: "Installation guide", to: "/install" },
      { label: "Release notes", to: "/releases" },
    ],
  },
  {
    title: "Safety & trust",
    links: [
      { label: "Safety and privacy", to: "/safety" },
      { label: "Community guidelines", to: "/guidelines" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms of service", to: "/terms" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", to: "/help" },
      { label: "FAQ", to: "/faq" },
      { label: "Contact us", to: "/contact" },
    ],
  },
];

export const legalLinks: NavItem[] = [
  { label: "Privacy policy", to: "/privacy" },
  { label: "Terms of service", to: "/terms" },
  { label: "Community guidelines", to: "/guidelines" },
];
