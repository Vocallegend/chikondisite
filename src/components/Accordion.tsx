import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/**
 * A disclosure list built on native <details>/<summary>.
 *
 * The browser supplies the keyboard behaviour, the expanded/collapsed state and
 * the screen-reader announcement, which is more than a hand-rolled div version
 * usually manages. The only thing added is styling.
 */
export type AccordionItem = { id: string; question: string; children: ReactNode };

export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  return (
    <div className={["divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10", className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <details key={item.id} className="group bg-ink-900/30 open:bg-ink-900/60">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left text-base font-medium text-white marker:hidden hover:bg-white/5 sm:px-6 sm:py-5">
            <span>{item.question}</span>
            <ChevronDown
              className="mt-0.5 h-5 w-5 shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="px-5 pb-5 text-sm leading-relaxed text-ink-300 sm:px-6 sm:pb-6">
            {item.children}
          </div>
        </details>
      ))}
    </div>
  );
}
