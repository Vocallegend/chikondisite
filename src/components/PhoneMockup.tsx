/**
 * A phone frame for real in-app artwork.
 *
 * The artwork is the app's own onboarding and chat imagery, shipped inside the
 * APK. Nothing here is a mockup of a screen: the frame holds an image, and the
 * image is whatever the operator puts in `src`. When genuine screenshots become
 * available, drop them into `public/app/` and pass their paths here.
 */
export function PhoneMockup({
  src,
  alt,
  caption,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={["flex flex-col items-center", className].filter(Boolean).join(" ")}>
      <div className="relative w-full max-w-[19rem] rounded-[2.6rem] border border-white/15 bg-ink-900 p-2.5 shadow-2xl shadow-black/50">
        <div className="absolute top-2.5 left-1/2 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-ink-950/80" />
        <div className="relative overflow-hidden rounded-[2.1rem] bg-ink-950">
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="aspect-[9/19] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 rounded-[2.1rem] ring-1 ring-inset ring-white/10" />
        </div>
      </div>
      {caption && (
        <figcaption className="mt-4 max-w-[19rem] text-center text-sm text-ink-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
