/**
 * What Chikondi actually does.
 *
 * Every entry here maps to a real screen in the Android app (src/routes/*) and a
 * real capability in the backend. There are no aspirational features and no
 * "coming soon" promises, because a features page that overstates the product is
 * the first thing a new member catches you on.
 *
 * `icon` is a lucide-react icon name, resolved in the component that renders it.
 */

export type Feature = {
  icon: string;
  title: string;
  summary: string;
  points: string[];
};

export const features: Feature[] = [
  {
    icon: "Compass",
    title: "Discover people nearby",
    summary:
      "Browse a steady stream of people whose preferences and yours line up, one profile at a time.",
    points: [
      "See age, city or town, photos, interests and what someone is looking for",
      "Pass or like in a single tap",
      "Your feed reflects your own distance, age and preference settings",
    ],
  },
  {
    icon: "Heart",
    title: "Like, super like and match",
    summary:
      "When two people both like each other it becomes a match, and a conversation opens.",
    points: [
      "A like tells someone you are interested",
      "A super like makes it clear you are especially interested",
      "See who has liked you and decide from there",
    ],
  },
  {
    icon: "MessageCircle",
    title: "Chat with your matches",
    summary: "Talk properly once you have matched, with the basics you expect from messaging.",
    points: [
      "One-to-one conversations with your matches",
      "Read your conversations in a single inbox",
      "Leave a conversation at any time",
    ],
  },
  {
    icon: "UserRound",
    title: "Profiles that say something",
    summary:
      "Build a profile that shows who you are, not just what you look like.",
    points: [
      "Add photos and a short bio",
      "Share your interests and what you are looking for",
      "Control what other members can see about you",
    ],
  },
  {
    icon: "SlidersHorizontal",
    title: "Matching on your terms",
    summary: "Set what you are looking for, and change it whenever you like.",
    points: [
      "Distance, age range and gender preferences",
      "Relationship goals and interests",
      "Changes take effect in your feed, not weeks later",
    ],
  },
  {
    icon: "Bell",
    title: "Notifications that matter",
    summary: "Know when someone likes you, matches with you or sends a message.",
    points: [
      "Notifications for likes, matches and new messages",
      "Adjust what you are told, and when",
      "Built on the phone's own notification system",
    ],
  },
  {
    icon: "ShieldCheck",
    title: "Blocking and reporting that work",
    summary:
      "If someone makes you uncomfortable, blocking is enforced on the server, not just hidden on your phone.",
    points: [
      "Block a member and they can no longer message or interact with you",
      "Report a profile, a conversation or a single message",
      "Reports are reviewed by a human, with an audit trail",
    ],
  },
  {
    icon: "Eye",
    title: "Know who viewed you",
    summary: "See the members who have looked at your profile.",
    points: [
      "A list of recent profile visitors",
      "Visits respect your privacy settings",
    ],
  },
  {
    icon: "BadgeCheck",
    title: "Request verification",
    summary:
      "You can ask to be verified. A member of the team reviews the request, and verification is granted on the server — it can never be set by the app itself.",
    points: [
      "Request verification from inside the app",
      "A person reviews each request",
      "Verification status is shown on your profile",
    ],
  },
  {
    icon: "Lock",
    title: "Privacy you can see",
    summary:
      "Your account, your photos and your conversations are yours. Access is controlled at the database level, so other members cannot query your details.",
    points: [
      "Other members cannot see your email, phone number or exact location",
      "Deleting your account removes your profile and personal information",
      "Row-level security protects your data on the server",
    ],
  },
  {
    icon: "GraduationCap",
    title: "Guidance before you meet",
    summary:
      "Practical safety guidance sits inside the app, for the moment before you meet someone in person.",
    points: [
      "What to do before a first meeting",
      "How to spot common scams and pressure tactics",
      "How to report and block, from anywhere",
    ],
  },
  {
    icon: "MapPin",
    title: "Built for Zambia",
    summary:
      "Chikondi is made for people here: local cities and towns, local context, and a design that works on the phones people actually use.",
    points: [
      "Works on Android 7.0 and above",
      "A small download that runs comfortably on mid-range phones",
      "Direct updates from this website, no app store required",
    ],
  },
];
