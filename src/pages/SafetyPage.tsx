import { AlertOctagon, Ban, Eye, Flag, ShieldCheck, UserCheck } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { DownloadCta } from "@/components/DownloadCta";
import { Notice } from "@/components/Notice";
import { PageHero } from "@/components/PageHero";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";

const tools = [
  {
    icon: Ban,
    title: "Blocking that holds",
    body: "Block a member and they cannot message you or interact with you. Enforced on the server, not hidden on your phone.",
  },
  {
    icon: Flag,
    title: "Reporting from anywhere",
    body: "Report a profile, a conversation or a single message, and say why. Detail helps us act faster.",
  },
  {
    icon: Eye,
    title: "Human moderation",
    body: "Reports are reviewed by a person, with serious cases handled first. Moderation decisions are logged.",
  },
  {
    icon: UserCheck,
    title: "18+ enforcement",
    body: "Your date of birth is checked on the server, so the age rule is enforced rather than politely requested.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by default",
    body: "Other members cannot see your email, your phone number or your exact location. Access is controlled at the database level.",
  },
  {
    icon: AlertOctagon,
    title: "You stay in control",
    body: "Leave any conversation, change what you share, and delete your account from Settings whenever you decide to.",
  },
];

const meetingTips = [
  "Tell a friend or family member where you are going, who you are meeting and when you expect to be back.",
  "Meet in a public place for the first few times, and stay in public until you trust the person.",
  "Arrange your own transport there and back, so leaving is always your decision.",
  "Meet during the day if you can, and keep the first meeting short.",
  "Stay sober enough to think clearly, and watch your own drink.",
  "Keep your phone charged and with data, and share your live location with someone you trust.",
];

const redFlags = [
  "They push to move the conversation off Chikondi immediately",
  "They ask for money, gift cards, airtime or crypto — always a scam",
  "They claim a sudden emergency that only your money can solve",
  "They ask for your ID, bank details or passwords",
  "They refuse to video call, or keep finding reasons not to meet",
  "Their story keeps changing, or the details do not add up",
];

export default function SafetyPage() {
  return (
    <PageShell path="/safety">
      <PageHero
        title="Safety and privacy on Chikondi"
        lead="Chikondi gives you real tools and clear guidance. It cannot promise that a stranger is safe, and this page does not pretend otherwise."
      />

      <Section eyebrow="Your tools" title="What you can do, right now">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <Reveal key={tool.title} delay={(index % 3) * 0.05}>
              <div className="h-full rounded-2xl border border-white/10 bg-ink-900/40 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-300">
                  <tool.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{tool.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{tool.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Before you meet"
        title="The guidance that matters most"
        lead="Meeting someone from any dating app carries risk. These are the habits that reduce it."
        tone="muted"
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {meetingTips.map((tip) => (
            <li
              key={tip}
              className="flex gap-3 rounded-2xl border border-white/10 bg-ink-950/60 p-5 text-sm leading-relaxed text-ink-300"
            >
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="Watch for this"
        title="Common red flags"
        lead="Romance scams follow patterns. Knowing them is most of the defence."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <ul className="space-y-3">
            {redFlags.map((flag) => (
              <li
                key={flag}
                className="flex gap-3 rounded-xl border border-brand-500/25 bg-brand-500/5 p-4 text-sm leading-relaxed text-ink-200"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-5">
            <Notice tone="danger" title="If someone asks you for money">
              It is a scam. There is no emergency that a stranger on a dating app needs your money
              for. Stop the conversation, block the person and report them.
            </Notice>
            <Notice tone="danger" title="If someone threatens you">
              Do not pay, and do not delete the messages. Block them, report them, and if they are
              threatening to share private images, contact the police.
            </Notice>
            <Notice tone="warning" title="In immediate danger">
              Contact your local emergency services directly. Chikondi is not an emergency-response
              service and cannot help you fast enough in a real emergency.
            </Notice>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="The limits"
        title="What Chikondi cannot promise"
        tone="muted"
        lead="A safety page that only lists features is a sales page. These are the honest limits."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              icon: AlertOctagon,
              title: "We do not run background checks",
              body: "No dating app can screen every member's history. Chikondi does not, and does not claim to.",
            },
            {
              icon: ShieldCheck,
              title: "We cannot guarantee intentions",
              body: "A verified profile is a reviewed profile, not a guarantee of good behaviour.",
            },
            {
              icon: Eye,
              title: "Moderation is not instant",
              body: "Human review takes time. Blocking is immediate — block first, and report alongside it.",
            },
            {
              icon: UserCheck,
              title: "Nobody can police your date",
              body: "Once you meet in person, the precautions above are what protect you. Take them.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-ink-950/60 p-6">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <item.icon className="h-4 w-4 text-brand-300" aria-hidden="true" />
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="More detail" title="Read the documents behind this page">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { to: "/guidelines", label: "Community Guidelines", body: "The rules every member agrees to." },
            { to: "/legal/safety-policy", label: "Safety Policy", body: "How we approach safety, in full." },
            { to: "/privacy", label: "Privacy Policy", body: "What we collect, and why." },
          ].map((link) => (
            <ButtonLink
              key={link.to}
              to={link.to}
              variant="secondary"
              className="h-auto flex-col items-start gap-1 rounded-2xl px-6 py-5 text-left"
            >
              <span className="text-base font-semibold text-white">{link.label}</span>
              <span className="text-sm font-normal text-ink-400">{link.body}</span>
            </ButtonLink>
          ))}
        </div>
      </Section>

      <DownloadCta
        title="Download Chikondi"
        lead="Set up your profile, take your time, and use the tools above when you need them."
      />
    </PageShell>
  );
}
