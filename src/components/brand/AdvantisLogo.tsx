type AdvantisLogoProps = {
  className?: string;
  compact?: boolean;
  tone?: "dark" | "light";
  subtitle?: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function AdvantisLogo({
  className,
  compact = false,
  tone = "dark",
  subtitle,
}: AdvantisLogoProps) {
  const primaryText = tone === "light" ? "text-white" : "text-[#1f5d94]";
  const secondaryText = tone === "light" ? "text-[#9fe3ff]" : "text-[#61b8e9]";
  const subtitleText = tone === "light" ? "text-white/70" : "text-[#58718d]";

  return (
    <div className={cx("flex items-center gap-3", className)}>
      <svg
        aria-hidden="true"
        className="h-12 w-12 shrink-0 drop-shadow-[0_14px_24px_rgba(76,143,216,0.28)]"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="advantis-badge" x1="12" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7FD8F8" />
            <stop offset="0.55" stopColor="#4F94D8" />
            <stop offset="1" stopColor="#2B67A7" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="20" fill="url(#advantis-badge)" />
        <path
          d="M24 43.5L30.4 18H35.8L42 43.5H37.2L35.95 38H29.95L28.7 43.5H24ZM30.95 34.1H35L33.05 25.1L30.95 34.1Z"
          fill="white"
        />
        <path d="M32.4 12.5L34.1 8.9L35.8 12.5L39.4 14.2L35.8 15.9L34.1 19.5L32.4 15.9L28.8 14.2L32.4 12.5Z" fill="#DFF7FF" />
      </svg>

      {!compact && (
        <div className="min-w-0">
          <div className={cx("text-[0.78rem] font-black uppercase tracking-[0.34em] leading-none", primaryText)}>
            Advantis
          </div>
          <div className={cx("mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.3em] leading-none", secondaryText)}>
            Medical
          </div>
          {subtitle ? (
            <div className={cx("mt-2 text-xs font-medium leading-none", subtitleText)}>
              {subtitle}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
