import { ButtonLink } from "@/components/Button";
import { DownloadCta } from "@/components/DownloadCta";
import { PhoneMockup } from "@/components/PhoneMockup";
import { PageHero } from "@/components/PageHero";
import { PageShell } from "@/components/PageShell";
import { Section } from "@/components/Section";
import { site } from "@/data/site";

const steps: {
  title: string;
  body: string;
  detail: string[];
  image?: string;
  alt?: string;
}[] = [
  {
    title: "Download and install the app",
    body: "Get the official APK from this website and install it on your Android phone. It takes a moment; there is no store account to create.",
    detail: [
      "The Download page shows the current version and its file size",
      "The installation guide covers the one screen Android shows for direct downloads",
      "Requires Android " + site.android.minVersion + " or newer",
    ],
    image: "/app/welcome.jpg",
    alt: "Chikondi welcome artwork",
  },
  {
    title: "Create your account and confirm you are 18+",
    body: "Sign up with your email address. You confirm your date of birth, and Chikondi checks it server-side so the 18+ rule is real rather than a tick box.",
    detail: [
      "One account, one person — sharing accounts is against the rules",
      "Your email is never shown to other members",
      "You can reset your password from the sign-in screen if you forget it",
    ],
  },
  {
    title: "Build a profile worth replying to",
    body: "Add a few photos, a short bio, and what you are actually looking for. Profiles that say something get better conversations.",
    detail: [
      "Photos, bio, interests and relationship goals",
      "Set what you want to see: distance, age range and more",
      "You can change any of it later from your profile",
    ],
  },
  {
    title: "Discover, like and match",
    body: "Browse people whose preferences line up with yours. Pass on the ones that are not for you; like the ones that are.",
    detail: [
      "See age, city or town, photos and interests",
      "A super like says you are especially interested",
      "When two people like each other, it becomes a match",
    ],
    image: "/app/what-to-expect.jpg",
    alt: "Chikondi onboarding artwork about what to expect",
  },
  {
    title: "Start the conversation",
    body: "Messaging opens when you match. Say something specific about their profile — it works far better than a one-word opener.",
    detail: [
      "One-to-one conversations with your matches",
      "Your inbox keeps every conversation in one place",
      "You can leave any conversation, and block anyone, at any time",
    ],
    image: "/app/chats.jpg",
    alt: "Chikondi messaging artwork",
  },
  {
    title: "Meet safely, on your terms",
    body: "If you decide to meet, meet somewhere public, tell someone where you are going, and arrange your own way home. Chikondi's guidance is there for exactly this moment.",
    detail: [
      "Block and report from any profile or conversation",
      "Reports are reviewed by a person, with serious cases handled first",
      "In immediate danger, contact emergency services directly",
    ],
    image: "/app/connect-safely.jpg",
    alt: "Chikondi safety artwork",
  },
];

export default function HowItWorksPage() {
  return (
    <PageShell path="/how-it-works">
      <PageHero
        title="How Chikondi works"
        lead="From the first download to the first message, here is the whole journey — described exactly as it happens, without the marketing gloss."
        actions={
          <ButtonLink to="/download" size="lg">
            Get started
          </ButtonLink>
        }
      />

      <Section>
        <ol className="space-y-16 sm:space-y-20">
          {steps.map((step, index) => (
            <li key={step.title}>
              <div
                className={[
                  "grid items-center gap-10 lg:grid-cols-2 lg:gap-14",
                  index % 2 === 1 && step.image ? "lg:[&>*:first-child]:order-2" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-brand-300 uppercase">
                    Step {index + 1}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{step.title}</h2>
                  <p className="mt-4 text-base leading-relaxed text-ink-300">{step.body}</p>
                  <ul className="mt-5 space-y-2.5">
                    {step.detail.map((line) => (
                      <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink-400">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {step.image ? (
                  <div className="flex justify-center">
                    <PhoneMockup src={step.image} alt={step.alt ?? step.title} />
                  </div>
                ) : (
                  <div className="hidden lg:block" />
                )}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="muted" eyebrow="The honest part" title="What Chikondi cannot do for you">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "It cannot verify everyone",
              body: "We do not run background checks and cannot guarantee anyone's identity, intentions or behaviour. Treat a new match as you would anyone you met online.",
            },
            {
              title: "It cannot promise a match",
              body: "Matching depends on both people, and on your preferences being realistic. Widening your filters improves your odds more than any feature here.",
            },
            {
              title: "It is not an emergency service",
              body: "If you are in immediate danger, contact emergency services directly. Chikondi cannot help you fast enough in a real emergency.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-ink-950/60 p-6">
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <DownloadCta title="Download Chikondi and start today" />
    </PageShell>
  );
}
