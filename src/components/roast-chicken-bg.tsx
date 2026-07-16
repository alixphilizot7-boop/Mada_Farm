export function RoastChickenBg() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      className="pointer-events-none absolute -right-10 -bottom-16 -z-10 h-64 w-64 select-none text-amber-900/[0.06] dark:text-amber-100/[0.05] sm:h-80 sm:w-80 md:-right-6 md:-bottom-20 md:h-[26rem] md:w-[26rem]"
    >
      {/* steam */}
      <path
        d="M150 60c-10-14-2-22 4-32M180 50c-10-14-2-22 4-32M210 60c-10-14-2-22 4-32"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* platter */}
      <ellipse cx="200" cy="330" rx="150" ry="24" fill="currentColor" />
      {/* body */}
      <path
        d="M120 250c0-70 36-120 80-120s80 50 80 120c0 40-36 64-80 64s-80-24-80-64z"
        fill="currentColor"
      />
      {/* wing */}
      <path
        d="M150 190c-18 6-30 24-28 46 14 8 32 4 40-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* drumstick left */}
      <path
        d="M150 288c-20 10-46 14-64 44-8 13 4 28 18 22 8 24 34 26 42 6 18-4 30-20 30-40"
        fill="currentColor"
      />
      <circle cx="82" cy="352" r="16" fill="currentColor" />
      {/* drumstick right */}
      <path
        d="M250 288c20 10 46 14 64 44 8 13-4 28-18 22-8 24-34 26-42 6-18-4-30-20-30-40"
        fill="currentColor"
      />
      <circle cx="318" cy="352" r="16" fill="currentColor" />
      {/* grill marks */}
      <path
        d="M140 190l30 90M175 175l32 100M215 175l30 100M250 190l28 88"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
