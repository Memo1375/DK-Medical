import React from 'react';

interface DkLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'symbol';
  theme?: 'light' | 'dark';
  showSubtitle?: boolean;
}

export const DkLogo: React.FC<DkLogoProps> = ({
  className = 'h-10 sm:h-12 w-auto',
  variant = 'full',
  theme = 'light',
  showSubtitle = true,
}) => {
  const isDark = theme === 'dark';

  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 240 130"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="DK Medical Logo Mark"
      >
        {/* Letter D (Teal #4EC2B5) */}
        <path
          d="M 18 20 L 72 20 C 104 20 120 38 120 65 C 120 92 104 110 72 110 L 18 110 Z M 44 42 L 44 88 L 70 88 C 88 88 95 78 95 65 C 95 52 88 42 70 42 Z"
          fill="#4EC2B5"
        />
        {/* Letter K (Ocean Blue #0178A2 or lighter on dark) */}
        <path
          d="M 136 20 L 162 20 L 162 58 L 205 20 L 238 20 L 186 65 L 242 110 L 208 110 L 162 72 L 162 110 L 136 110 Z"
          fill={isDark ? '#38BDF8' : '#0178A2'}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 440 130"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DK Medical & General Supplies"
    >
      {/* Letter D (Teal #4EC2B5) */}
      <path
        d="M 18 20 L 72 20 C 104 20 120 38 120 65 C 120 92 104 110 72 110 L 18 110 Z M 44 42 L 44 88 L 70 88 C 88 88 95 78 95 65 C 95 52 88 42 70 42 Z"
        fill="#4EC2B5"
      />

      {/* Letter K (Ocean Blue #0178A2 / #38BDF8) */}
      <path
        d="M 136 20 L 162 20 L 162 58 L 205 20 L 238 20 L 186 65 L 242 110 L 208 110 L 162 72 L 162 110 L 136 110 Z"
        fill={isDark ? '#38BDF8' : '#0178A2'}
      />

      {/* Medical Wordmark */}
      <text
        x="250"
        y="58"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif"
        fontWeight="700"
        fontSize="36"
        fill={isDark ? '#FFFFFF' : '#4EC2B5'}
        letterSpacing="-0.5"
      >
        Medical
      </text>

      {/* Subtitle */}
      {showSubtitle && (
        <text
          x="251"
          y="78"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif"
          fontWeight="700"
          fontSize="10"
          fill={isDark ? '#94A3B8' : '#0178A2'}
          letterSpacing="1.2"
        >
          MEDICAL &amp; GENERAL SUPPLIES
        </text>
      )}

      {/* Red ECG Pulse Line */}
      <path
        d="M 218 95 L 272 95 L 277 91 L 282 99 L 290 54 L 300 120 L 308 80 L 314 100 L 320 95 L 328 95 C 334 95 340 86 346 95 L 420 95"
        stroke="#E3111D"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
