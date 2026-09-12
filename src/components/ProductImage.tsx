import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { DkLogo } from './DkLogo';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className = '' }) => {
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(src && src.trim() !== ''));
  const [error, setError] = useState<boolean>(!src || src.trim() === '');

  // Generate candidate list from initial src
  useEffect(() => {
    if (!src || src.trim() === '') {
      setCandidates([]);
      setError(true);
      setLoading(false);
      return;
    }

    const cleanSrc = src.trim();
    const list: string[] = [cleanSrc];

    // Determine filename variations (e.g. .jpeg, .jpg, .svg, and space/hyphen permutations)
    const urlParts = cleanSrc.split('/');
    const fileNameWithExt = urlParts[urlParts.length - 1];
    const extMatch = fileNameWithExt.match(/\.([a-zA-Z0-9]+)$/);
    const baseName = extMatch ? fileNameWithExt.substring(0, extMatch.index) : fileNameWithExt;

    const baseHyphen = baseName.toLowerCase().replace(/[\s_]+/g, '-');
    const baseSpaced = baseName.replace(/[-_]+/g, ' ');

    const extensions = ['.jpeg', '.jpg', '.png', '.svg', '.webp'];

    for (const ext of extensions) {
      const p1 = `/images/${baseName}${ext}`;
      const p2 = `/images/${baseHyphen}${ext}`;
      const p3 = `/images/${baseSpaced}${ext}`;
      if (!list.includes(p1)) list.push(p1);
      if (!list.includes(p2)) list.push(p2);
      if (!list.includes(p3)) list.push(p3);
    }

    setCandidates(list);
    setCandidateIndex(0);
    setLoading(true);
    setError(false);
  }, [src]);

  // Branded DK Medical logo card for products without images attached or on image load failure
  const logoPlaceholder = (
    <div
      className={`w-full h-48 sm:h-52 bg-gradient-to-b from-slate-50 via-white to-slate-50/90 border border-slate-200/90 rounded-lg flex flex-col items-center justify-center p-2 sm:p-5 text-center select-none group relative overflow-hidden transition-all ${className}`}
      role="img"
      aria-label={`${alt} - DK Medical & General Supplies`}
    >
      {/* Background ECG watermark pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <svg viewBox="0 0 400 100" className="w-full h-auto stroke-[#0178A2] fill-none" strokeWidth="2">
          <path d="M 0 50 L 120 50 L 130 35 L 140 65 L 150 15 L 165 85 L 175 45 L 185 55 L 195 50 L 400 50" />
        </svg>
      </div>

      {/* Branded Logo Showcase */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[210px] space-y-2">
        <DkLogo
          variant="full"
          theme="light"
          className="w-full h-auto max-h-10 sm:max-h-12 object-contain transition-transform duration-300 group-hover:scale-105"
        />

        <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6F3F7] border border-[#0178A2]/20 text-[9.5px] font-bold tracking-wide text-[#0178A2] uppercase shadow-2xs">
          <span>DK Medical Supply</span>
        </div>
      </div>
    </div>
  );

  if (error || candidates.length === 0) {
    return logoPlaceholder;
  }

  const currentSrc = candidates[candidateIndex] || src;

  return (
    <div className={`relative w-full h-48 sm:h-52 bg-slate-50 border border-slate-200/80 rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 z-10 animate-pulse">
          <Loader2 className="w-6 h-6 text-[#0178A2] animate-spin" />
        </div>
      )}

      <img
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
        onError={() => {
          if (candidateIndex + 1 < candidates.length) {
            setCandidateIndex(prev => prev + 1);
          } else {
            setLoading(false);
            setError(true);
          }
        }}
        className={`w-full h-full object-contain p-3 transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};
