/**
 * Help centre articles and FAQ.
 *
 * Written from the behaviour the app actually has: the direct-APK install flow,
 * the update registry, the settings screens and the safety tools. Where the
 * answer depends on a decision the operator has not made yet (a support address,
 * for example) the copy says so and points at the Contact page rather than
 * inventing a route.
 */

export type FaqItem = { question: string; answer: string };

export const faqGroups: { title: string; items: FaqItem[] }[] = [
  {
    title: "Downloading and installing",
    items: [
      {
        question: "Where do I download Chikondi?",
        answer:
          "From the Download page on this website. That is the only official source. If you got the app anywhere else, you cannot be sure what is in it.",
      },
      {
        question: "Does Chikondi cost anything to download?",
        answer:
          "No. The app is free to download from this website, and you are never charged for the download itself. Chikondi may show labelled sponsored content inside the app.",
      },
      {
        question: "Which Android versions are supported?",
        answer:
          "Android 7.0 (Nougat) and above. Older phones cannot install the app.",
      },
      {
        question: "Why does this download an APK instead of opening Google Play?",
        answer:
          "Chikondi is distributed directly from this website. Installing an app from outside Google Play is normal on Android, but it does mean the operating system will ask you to confirm before installing.",
      },
    ],
  },
  {
    title: "Android security warnings",
    items: [
      {
        question: "Android showed a warning when I tried to install. Is that a virus?",
        answer:
          "It is not a virus. Android shows an additional confirmation for apps installed outside its own store, and its malware scanner may say it has not seen this app before. That is a reputation check about how widely an app has been seen, not a detection of anything malicious.",
      },
      {
        question: "Should I turn off Play Protect to install Chikondi?",
        answer:
          "No. Never disable Play Protect to install an app. Follow the Installation Guide instead; if a build cannot be installed without disabling your security protections, do not install that build and tell us through the Contact page.",
      },
      {
        question: "How do I know the file I downloaded is the genuine one?",
        answer:
          "Every release page on this website lists a SHA-256 checksum for the exact file published. After downloading, compute the checksum of your file and compare it. The Installation Guide and the Download page explain how.",
      },
    ],
  },
  {
    title: "Updates",
    items: [
      {
        question: "How do I update to a new version?",
        answer:
          "Download the latest APK from the Download page and install it over the version you already have. You do not need to uninstall first, and you will not lose your account or conversations.",
      },
      {
        question: "Will updating delete my account or my matches?",
        answer:
          "No. Your account, matches and conversations live on Chikondi's servers, not on your phone. Updating replaces the app; it does not touch your account.",
      },
      {
        question: "How do I know when there is a new version?",
        answer:
          "The app checks for a published update and will tell you when one is available. You can also check the Release Notes page here for the current version and its release date.",
      },
    ],
  },
  {
    title: "Your account",
    items: [
      {
        question: "I forgot my password. What now?",
        answer:
          "Use the password reset option on the app's sign-in screen. A reset code is sent to the address you registered with.",
      },
      {
        question: "Can I use Chikondi on more than one phone?",
        answer:
          "Your account can be signed in on a phone you control. For your safety, sign out of any device you no longer use, and change your password if you think someone else has had access.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Open Settings in the app and choose the account deletion option. Your profile and personal information are removed, subject to records we must keep for legal or safety reasons.",
      },
    ],
  },
  {
    title: "Safety and moderation",
    items: [
      {
        question: "How do I block someone?",
        answer:
          "Open their profile or your conversation with them and use the block option. Blocking is enforced on the server, so a blocked member cannot message or interact with you.",
      },
      {
        question: "How do I report someone?",
        answer:
          "Use the report option on their profile, your conversation, or an individual message. Reports go to the safety team and are reviewed by a person. Serious reports are handled first.",
      },
      {
        question: "Does Chikondi police carry out background checks?",
        answer:
          "No. Chikondi does not run background checks on members and cannot guarantee anyone's identity or intentions. Take the same precautions you would with anyone you meet online, and read the Safety page before meeting in person.",
      },
      {
        question: "I am in immediate danger. What should I do?",
        answer:
          "Contact your local emergency services directly. Chikondi is not an emergency-response service and must not be relied on for one.",
      },
    ],
  },
];

/** Help Centre articles. `id` is the anchor used for deep links. */
export type HelpArticle = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  note?: string;
};

export const helpArticles: HelpArticle[] = [
  {
    id: "download",
    title: "Download the app",
    summary: "Get the official Chikondi APK onto your phone.",
    steps: [
      "Open the Download page on this website, on the phone you want to install Chikondi on.",
      "Tap the download button. The file is around 8 MB, so it takes a moment on a slow connection.",
      "When your browser asks whether to keep the file, choose Keep or Download.",
      "The file appears in your Downloads folder, or in the browser's download list.",
    ],
    note:
      "Download from this website only. A link forwarded on WhatsApp or found in a group is not a channel we can vouch for.",
  },
  {
    id: "install",
    title: "Install the APK",
    summary: "Install Chikondi from the file you downloaded.",
    steps: [
      "Open your Downloads and tap the Chikondi APK.",
      "Android asks whether you want to install this app. Tap Install.",
      "Depending on your phone, you may first be asked to allow installs from this source. Allow it for your browser, then tap Install.",
      "When it finishes, tap Open, or find Chikondi in your app drawer.",
    ],
    note:
      "You can turn the install-from-this-source permission back off afterwards; Chikondi does not need it once it is installed.",
  },
  {
    id: "blocked-install",
    title: "If Android blocks the install",
    summary: "What the warning means, and the safe way past it.",
    steps: [
      "Read the message. If it says the app has not been seen before, that is a reputation note about a new package, not a detection of anything malicious.",
      "If it offers a choice to install anyway, choose it, then continue with the install.",
      "If it does not let you continue, do not disable Play Protect. Close the warning and contact us through the Contact page with your phone model and Android version.",
    ],
    note:
      "Never turn off Play Protect, and never install a build that requires you to. There is no version of Chikondi that asks you to disable your phone's security.",
  },
  {
    id: "update",
    title: "Update to a new version",
    summary: "Install a newer release without losing anything.",
    steps: [
      "Open the Download page and check the version shown there.",
      "Download and open the new APK.",
      "Install it over the version you already have — do not uninstall first.",
      "Open Chikondi and sign in if you are asked. Your matches and conversations are still there.",
    ],
    note:
      "If Android refuses to install an update, it is usually because the installed copy came from a different source with a different signature. Uninstalling first is safe for your account, but it clears local data such as your session.",
  },
  {
    id: "verify-download",
    title: "Verify your download",
    summary: "Confirm the file you downloaded is the exact published release.",
    steps: [
      "On the Download page, copy the SHA-256 checksum shown for the current release.",
      "On a computer, run the right command for your system (see below) against the APK file.",
      "Compare the two long strings. If they match exactly, the file is unchanged from the published release.",
      "If they do not match, delete the file and download it again from this website. If it still does not match, tell us through the Contact page.",
    ],
    note:
      "Windows: certutil -hashfile chikondi.apk SHA256 · macOS or Linux: shasum -a 256 chikondi.apk",
  },
  {
    id: "account-access",
    title: "Get back into your account",
    summary: "Signed out, or stuck at the sign-in screen.",
    steps: [
      "Check that you are entering the email address you registered with.",
      "Use the password reset option and follow the code sent to that address.",
      "If the code does not arrive, check your spam folder and that you can receive mail at that address.",
      "If you are still stuck, contact us through the Contact page and describe what you see.",
    ],
  },
  {
    id: "profile",
    title: "Edit your profile and photos",
    summary: "Change what other members see about you.",
    steps: [
      "Open your profile from the app's navigation.",
      "Edit your details — photos, bio, interests and what you are looking for.",
      "Save your changes. Your profile updates for other members straight away.",
    ],
    note: "Keep your photos your own. Uploading someone else's photos is against the Community Guidelines.",
  },
  {
    id: "report-block",
    title: "Report or block someone",
    summary: "Take action when a member makes you uncomfortable.",
    steps: [
      "Open the member's profile, or your conversation with them.",
      "Choose Block to stop all contact, or Report to send it to the safety team.",
      "When reporting, choose the reason that fits and add detail if you can. Detail helps us act faster.",
      "Blocking is immediate and is enforced on the server, not just hidden on your phone.",
    ],
  },
  {
    id: "notifications",
    title: "Notifications not arriving",
    summary: "Get told about likes, matches and messages again.",
    steps: [
      "Open your phone's Settings, find Chikondi, and check that notifications are allowed.",
      "Check that notifications are switched on inside the app's settings too.",
      "On some phones, battery optimisation stops background apps from delivering notifications. Allow Chikondi to run in the background.",
      "Open the app once so it can re-register with the notification service, then test with a friend.",
    ],
  },
  {
    id: "delete-account",
    title: "Delete your account",
    summary: "Leave Chikondi and remove your information.",
    steps: [
      "Open Settings in the app.",
      "Choose the account deletion option and confirm.",
      "Your profile and personal information are removed, subject to records we must keep for legal or safety reasons.",
    ],
    note:
      "Deleting the app from your phone does not delete your account. Use the in-app deletion option.",
  },
];
