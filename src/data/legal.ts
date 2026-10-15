/**
 * Chikondi legal documents.
 *
 * This is the website's copy of the registry the Android app already ships
 * (src/lib/legal-documents.ts in the app repo). It is deliberately the same
 * wording: a member who reads the Privacy Policy in the app and on the website
 * must be reading one policy, not two that drifted apart.
 *
 * Two things are preserved from the app version because they matter here too:
 *
 *   1. Internal `[Operator: ...]` notes are stripped before rendering. They are
 *      addressed to whoever configures the product, not to a member, and a
 *      bracketed to-do inside a document someone is consenting to reads as
 *      though nobody had checked.
 *
 *   2. The legal entity name, address and contact address are REAL operator
 *      decisions. They are empty here, and `LEGAL_CONFIG_READY` is false while
 *      they are empty, so the pages show an explicit "operator configuration
 *      required" notice instead of quietly shipping unfinished placeholders.
 *
 * Nothing in this file invents a company, a date, an address or a legal basis.
 */

export type LegalSection = {
  heading: string;
  body?: string;
  bullets?: string[];
};

export type LegalDocument = {
  key: string;
  title: string;
  version: string;
  /** ISO date. Operator-configurable; not a real effective date until set. */
  effectiveDate: string;
  lastUpdated: string;
  intro: string;
  highlights: string[];
  sections: LegalSection[];
};

export const LEGAL_DOCUMENT_VERSION = "0.1";

/**
 * Operator placeholders. Fill these in when the legal entity exists — never
 * before, and never with an invented value.
 */
export const LEGAL_PLACEHOLDERS = {
  LEGAL_ENTITY_NAME: "",
  LEGAL_CONTACT_EMAIL: "",
  PRIVACY_CONTACT_EMAIL: "",
  REGISTERED_ADDRESS: "",
  GOVERNING_LAW: "",
};

export const LEGAL_CONFIG_READY =
  Boolean(LEGAL_PLACEHOLDERS.LEGAL_ENTITY_NAME) &&
  Boolean(LEGAL_PLACEHOLDERS.LEGAL_CONTACT_EMAIL) &&
  Boolean(LEGAL_PLACEHOLDERS.REGISTERED_ADDRESS);

const OPERATOR_NOTE = /\[Operator:[^\]]*\]/g;

/** Remove internal operator notes and tidy the whitespace they leave behind. */
export function stripOperatorNotes(text: string): string {
  return text
    .replace(OPERATOR_NOTE, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** The bundled copy, exactly as written, notes included. Never render this. */
const RAW_LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    key: "terms",
    title: "Terms of Service",
    version: LEGAL_DOCUMENT_VERSION,
    effectiveDate: "2026-09-01",
    lastUpdated: "2026-09-01",
    intro:
      "These Terms of Service govern your use of the Chikondi app. By creating an account you agree to them. Please read them carefully.",
    highlights: [
      "Chikondi is strictly for persons aged 18 years and older, and accounts found to misstate a date of birth may be removed.",
      "You are responsible for activity that happens on your account, so keep your credentials secure.",
      "Never use Chikondi to threaten, extort, blackmail, scam, impersonate others, doxxing, or share non-consensual intimate content.",
      "You are in control of who you meet and where — please use the Safety Centre before meeting anyone.",
      "Chikondi may review reported content and take action including warnings, content removal, temporary or permanent restriction, suspension, or termination where reasonably necessary to protect users, the platform or third parties, subject to applicable law.",
      "In immediate danger, contact the appropriate emergency services directly.",
    ],
    sections: [
      {
        heading: "Chikondi is for adults",
        body: "Chikondi is strictly for persons aged 18 years and older. By creating an account you confirm that you are 18 or older. Accounts found to misstate a date of birth may be removed.",
      },
      {
        heading: "Your account",
        body: "You are responsible for keeping your login credentials secure and for activity that happens on your account. Do not share your account with anyone else.",
      },
      {
        heading: "How to behave",
        body: "Treat other members with respect. Do not use Chikondi to harass, threaten, stalk, scam, extort, defraud, impersonate, dox, or share non-consensual intimate content. Do not post content that is illegal, hateful, or sexually exploitative.",
      },
      {
        heading: "Meeting people",
        body: "You are in control of who you meet and where. Chikondi does not run background checks on members and cannot guarantee anyone's identity or intentions. Please read the Safety Centre before meeting anyone in person.",
      },
      {
        heading: "Content you share",
        body: "You keep ownership of the photos and text you upload, and you give Chikondi permission to host and display them in order to run the service. Do not upload content you do not have the right to share.",
      },
      {
        heading: "Enforcement",
        body: "Chikondi may review reported content and take action including warnings, content removal, temporary or permanent restriction, suspension, or termination where reasonably necessary to protect users, the platform or third parties, subject to applicable law. You may appeal eligible moderation actions.",
      },
      {
        heading: "Third-party services",
        bullets: [
          "Chikondi relies on third-party infrastructure and service providers to operate, including authentication, data storage, push notifications and advertising services.",
          "Those providers process data under their own terms and privacy policies.",
        ],
      },
      {
        heading: "No warranty",
        body: "Chikondi is provided as is. To the extent permitted by law we make no warranty that the service will be uninterrupted, error-free, or that any particular connection will be made.",
      },
      {
        heading: "Limitation of liability",
        body: "To the extent permitted by law, Chikondi is not liable for indirect or consequential loss arising from your use of the service. Nothing in these terms limits liability that cannot lawfully be limited.",
      },
      {
        heading: "Changes to these terms",
        body: "We may update these terms. When we do, we will change the version and updated date on this page. Continuing to use Chikondi after a change means you accept the updated terms.",
      },
      {
        heading: "Governing law",
        body: "These terms are governed by the laws of the Republic of Zambia.",
      },
      {
        heading: "Contact",
        body: "Questions about these terms can be sent through the Contact page on this website.",
      },
    ],
  },
  {
    key: "privacy",
    title: "Privacy Policy",
    version: LEGAL_DOCUMENT_VERSION,
    effectiveDate: "2026-09-01",
    lastUpdated: "2026-09-01",
    intro:
      "This policy explains what Chikondi collects, why, how it is used, and the control you have over your information.",
    highlights: [
      "We collect the information you give us to run your account, and technical information needed to keep the service working and safe.",
      "We use your date of birth to enforce the 18+ requirement, and your approximate location to show you people nearby. We do not show your exact location history.",
      "We do not sell your personal information.",
      "You can access, correct and delete your account information from inside the app.",
      "You can contact us about your data at any time through the Contact page on this website.",
    ],
    sections: [
      {
        heading: "Who operates Chikondi",
        body:
          (LEGAL_PLACEHOLDERS.LEGAL_ENTITY_NAME || "Chikondi") +
          (LEGAL_PLACEHOLDERS.REGISTERED_ADDRESS
            ? ", " + LEGAL_PLACEHOLDERS.REGISTERED_ADDRESS
            : "") +
          ". Questions about this policy can be sent to us from inside the app.",
      },
      {
        heading: "Information we collect",
        bullets: [
          "Profile information you provide: display name, date of birth, gender, city or town, bio, interests, photos, relationship goals and preferences.",
          "Activity information: likes, passes, matches, messages and profile visits needed to run the service.",
          "Technical information: device type, app version, login session information, approximate region derived from IP address, and security events such as logins, password resets and logouts.",
          "Photos you upload, and the status of any verification you request (we store verification status, not identity documents).",
        ],
      },
      {
        heading: "Why we collect it",
        bullets: [
          "To run your account and provide matching, messaging, notifications and profile display.",
          "To enforce the 18+ requirement and our Community Guidelines.",
          "To keep members safe, detect abuse and investigate reports.",
          "To improve the service and fix problems.",
        ],
      },
      {
        heading: "Legal basis",
        body: "We rely on your consent where required, and otherwise on the legitimate interests of operating a safe dating service, performance of the contract with you, and compliance with applicable legal obligations.",
      },
      {
        heading: "Location",
        body: "We use the city or town you set, not a continuous GPS trail. We do not publish your exact coordinates and we do not sell location data.",
      },
      {
        heading: "Sharing",
        body: "We share information with the service providers that host, store and deliver the app (for example authentication, data storage, push notification and advertising services). They process data under their own terms. We do not sell your personal information.",
      },
      {
        heading: "Advertising",
        body: "Chikondi may show sponsored content. Where a placement is advertising it is labelled as such. You can read more about how advertising providers handle data in their own privacy policies.",
      },
      {
        heading: "How long we keep it",
        body: "We keep personal information for as long as your account is active, and for a limited period afterwards where we need it for safety, legal or accounting reasons. See our Data Retention Policy for detail.",
      },
      {
        heading: "Your choices",
        bullets: [
          "Access and correct your profile information from inside the app.",
          "Delete your account from Settings. Deletion removes your profile and personal information, subject to records we must keep for legal or safety reasons.",
          "Contact us about your data using the Contact page on this website.",
        ],
      },
      {
        heading: "Security",
        body: "We use industry-standard measures including encryption in transit, access controls and monitoring. No service can promise perfect security, and we do not claim to.",
      },
      {
        heading: "Children",
        body: "Chikondi is for adults aged 18 and over. We do not knowingly collect information from anyone under 18. If we learn that a member is under 18, the account is removed.",
      },
      {
        heading: "Changes",
        body: "We may update this policy. When we do, we change the version and updated date on this page.",
      },
    ],
  },
  {
    key: "community-guidelines",
    title: "Community Guidelines",
    version: LEGAL_DOCUMENT_VERSION,
    effectiveDate: "2026-09-01",
    lastUpdated: "2026-09-01",
    intro:
      "Chikondi is a place for respectful, honest connection between adults in Zambia. These guidelines keep everyone safe. Everything here also applies in practice — reports are reviewed and actions are taken.",
    highlights: [
      "Use your real name, real photos and real information. No fake profiles, catfishing or impersonation.",
      "Chikondi is strictly for adults. Exploiting minors is not tolerated.",
      "Only share intimate or personal content with consent. Never pressure anyone.",
      "Never harass, threaten, stalk, scam, extort, or share private information and non-consensual intimate content.",
      "Block anyone who makes you uncomfortable, and report them from their profile or a conversation.",
      "In immediate danger, contact emergency services directly.",
    ],
    sections: [
      {
        heading: "Be respectful",
        body: "Treat everyone you meet with respect. Harassment, hate speech, threats and stalking are not allowed, and neither is content that demeans someone for who they are.",
      },
      {
        heading: "Be honest",
        body: "Use your real name, real photos and truth about yourself. No fake profiles, catfishing or impersonation.",
      },
      {
        heading: "Get consent",
        bullets: [
          "Only share intimate or personal content with consent. Never pressure anyone.",
          "Never share someone else's private information or photos without their permission.",
          "Never share non-consensual intimate content.",
        ],
      },
      {
        heading: "Before you meet",
        body: "Tell someone you trust where you are going, meet in a public place, arrange your own transport, and stay sober enough to leave if you want to.",
      },
      {
        heading: "Reporting",
        body: "If someone makes you uncomfortable, block them. If someone breaks these guidelines, report them from their profile, a conversation, or an individual message. Reports are reviewed by our safety team. In immediate danger, contact emergency services directly.",
      },
    ],
  },
  {
    key: "safety-policy",
    title: "Safety Policy",
    version: LEGAL_DOCUMENT_VERSION,
    effectiveDate: "2026-09-01",
    lastUpdated: "2026-09-01",
    intro:
      "This policy explains how Chikondi approaches safety. We provide tools and guidance — we do not promise that any user is safe, and we are not an emergency-response service.",
    highlights: [
      "18+ enforcement with server-side date-of-birth validation.",
      "Blocking that is enforced server-side: blocked users cannot message or interact.",
      "Severity classification, so critical cases are handled first.",
      "Moderation: human review and audit logging.",
      "We do not guarantee your physical safety, verify every user's identity or intentions, or perform background checks on members.",
      "In immediate danger, contact emergency services directly.",
    ],
    sections: [
      {
        heading: "How we approach safety",
        bullets: [
          "18+ enforcement with server-side date-of-birth validation.",
          "Blocking that is enforced server-side: blocked users cannot message or interact with you.",
          "Reporting, with serious reports classified and handled first.",
          "Human review of reports, with an audit trail of moderation decisions.",
          "Guidance on meeting safely, on the app and by phone.",
        ],
      },
      {
        heading: "What we do not do",
        body: "We do not guarantee your physical safety, verify every user's identity or intentions, or perform background checks on members.",
      },
      {
        heading: "Emergencies",
        body: "In immediate danger, contact the appropriate emergency services directly. Chikondi is not an emergency-response service.",
      },
    ],
  },
  {
    key: "data-retention",
    title: "Data Retention Policy",
    version: LEGAL_DOCUMENT_VERSION,
    effectiveDate: "2026-09-01",
    lastUpdated: "2026-09-01",
    intro:
      "Chikondi does not keep personal data forever. This policy defines how long different categories of data are retained, then deleted or anonymised. Legal and security holds override ordinary schedules where justified.",
    highlights: [
      "Profile data is kept while the account is active.",
      "Deleted accounts: personal data deleted or anonymised promptly; only legally or operationally required records are retained.",
      "Where a full delete is not possible, identifiers are removed and the record continues without identifying individuals.",
      "Data under a legal or security hold is retained only while the hold is justified.",
      "Backups are retained per the backup schedule and purged on the same cycle.",
    ],
    sections: [
      {
        heading: "Retention periods",
        bullets: [
          "Active accounts: profile data is kept while the account is active.",
          "Deleted accounts: personal data deleted or anonymised promptly; only legally/operationally required records retained.",
          "Messages and conversations: retained while the conversation is active and for a defined period after ending.",
          "Reports and moderation records: retained for the moderation retention period to support enforcement.",
          "Security/audit logs: retained for the security-log retention period.",
          "Backups: retained per the backup schedule and purged on the same cycle.",
          "Legal holds: data under a legal/security hold is retained only while the hold is justified.",
        ],
      },
      {
        heading: "Deletion vs anonymisation",
        body: "Where a full delete is not possible (for example moderation references), personal data is anonymised — identifiers are removed while the record continues to support safety and auditing without identifying individuals.",
      },
      {
        heading: "Keeping less by default",
        body: "Where a period has not been set for a category of data, we keep less and delete faster, rather than keeping it indefinitely.",
      },
    ],
  },
  {
    key: "law-enforcement",
    title: "Law Enforcement Policy",
    version: LEGAL_DOCUMENT_VERSION,
    effectiveDate: "2026-09-01",
    lastUpdated: "2026-09-01",
    intro:
      "Chikondi takes lawful requests from authorities seriously. This policy explains how we handle them. We never automatically disclose user information merely because someone claims to be police.",
    highlights: [
      "Every request is validated for legal basis and authenticity before any data is disclosed.",
      "We never disclose user information merely because someone claims to be police.",
      "Each request records the authority, the request type, the assigned administrator, the status, and what was disclosed and approved.",
      "Where permitted, we notify affected users about lawful disclosures.",
    ],
    sections: [
      {
        heading: "Validation first",
        body: "Every request is validated for legal basis and authenticity before any data is disclosed. Requests must come through proper channels and satisfy applicable legal requirements.",
      },
      {
        heading: "What we record",
        bullets: [
          "Request number, authority, request type, received date and legal basis.",
          "Requested data, assigned administrator, status and response date.",
          "Disclosed information and approval history.",
        ],
      },
      {
        heading: "Emergencies",
        body: "In genuine life-or-death emergencies we will assess each request as quickly as possible, balancing user safety, legal obligations and this policy.",
      },
      {
        heading: "User transparency",
        body: "Where we are permitted to do so we will notify affected users about lawful disclosures. We will not do so where notification is prohibited by law or would interfere with a lawful investigation.",
      },
    ],
  },
];

/** The bundled copy as it may be rendered: no internal operator notes. */
export const LEGAL_DOCUMENTS: readonly LegalDocument[] = RAW_LEGAL_DOCUMENTS.map((doc) => ({
  ...doc,
  intro: stripOperatorNotes(doc.intro),
  highlights: doc.highlights.map(stripOperatorNotes),
  sections: doc.sections.map((section) => ({
    ...section,
    ...(section.body === undefined ? {} : { body: stripOperatorNotes(section.body) }),
    ...(section.bullets === undefined ? {} : { bullets: section.bullets.map(stripOperatorNotes) }),
  })),
}));

/** Documents rendered as their own top-level pages. */
export const LEGAL_PAGE_KEYS = ["privacy", "terms", "guidelines"] as const;

/** Extra documents rendered under /legal/:slug. */
export const LEGAL_EXTRA_KEYS = ["safety-policy", "data-retention", "law-enforcement"] as const;

/** Route slug to document key. The three top-level pages use friendly slugs. */
export const LEGAL_ROUTE_TO_KEY: Record<string, string> = {
  privacy: "privacy",
  terms: "terms",
  guidelines: "community-guidelines",
  "safety-policy": "safety-policy",
  "data-retention": "data-retention",
  "law-enforcement": "law-enforcement",
};

export function getLegalDocument(key: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((doc) => doc.key === key);
}
