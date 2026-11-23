import React from 'react';

// subtle floating medical plus symbols with varying positions, sizes, colors and animation timings
const PLUS_ITEMS = [
  { top: '8%', left: '5%', size: 24, color: '#06b6d4', opacity: 0.20, anim: 'floatDriftA', dur: 24, delay: -4 },
  { top: '22%', left: '88%', size: 34, color: '#38bdf8', opacity: 0.16, anim: 'floatDriftB', dur: 32, delay: -12 },
  { top: '42%', left: '10%', size: 18, color: '#14b8a6', opacity: 0.22, anim: 'floatDriftC', dur: 20, delay: -8 },
  { top: '65%', left: '92%', size: 28, color: '#22d3ee', opacity: 0.18, anim: 'floatDriftD', dur: 28, delay: -18 },
  { top: '82%', left: '18%', size: 38, color: '#60a5fa', opacity: 0.14, anim: 'floatDriftA', dur: 36, delay: -15 },
  { top: '14%', left: '48%', size: 16, color: '#2dd4bf', opacity: 0.20, anim: 'floatDriftB', dur: 22, delay: -7 },
  { top: '35%', left: '76%', size: 26, color: '#0891b2', opacity: 0.17, anim: 'floatDriftC', dur: 30, delay: -22 },
  { top: '56%', left: '32%', size: 20, color: '#38bdf8', opacity: 0.18, anim: 'floatDriftD', dur: 26, delay: -11 },
  { top: '74%', left: '60%', size: 32, color: '#14b8a6', opacity: 0.15, anim: 'floatDriftA', dur: 34, delay: -27 },
  { top: '88%', left: '84%', size: 18, color: '#22d3ee', opacity: 0.20, anim: 'floatDriftB', dur: 19, delay: -5 },
  { top: '26%', left: '26%', size: 30, color: '#0284c7', opacity: 0.15, anim: 'floatDriftC', dur: 37, delay: -19 },
  { top: '60%', left: '4%', size: 22, color: '#2dd4bf', opacity: 0.19, anim: 'floatDriftD', dur: 25, delay: -14 },
  { top: '5%', left: '72%', size: 36, color: '#38bdf8', opacity: 0.14, anim: 'floatDriftA', dur: 39, delay: -9 },
  { top: '48%', left: '96%', size: 16, color: '#06b6d4', opacity: 0.22, anim: 'floatDriftB', dur: 21, delay: -16 },
  { top: '86%', left: '44%', size: 24, color: '#14b8a6', opacity: 0.17, anim: 'floatDriftC', dur: 27, delay: -3 },
  { top: '12%', left: '92%', size: 20, color: '#60a5fa', opacity: 0.18, anim: 'floatDriftD', dur: 23, delay: -20 },
];

export default function MedicalPlusBackground() {
  return (
    <div className="medical-plus-background" aria-hidden="true">
      {PLUS_ITEMS.map((item, index) => (
        <span
          key={index}
          className="medical-plus-item"
          style={{
            top: item.top,
            left: item.left,
            color: item.color,
            opacity: item.opacity,
            animationName: item.anim,
            animationDuration: `${item.dur}s`,
            animationDelay: `${item.delay}s`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width={item.size}
            height={item.size}
            fill="currentColor"
            style={{ display: 'block' }}
          >
            <rect x="9.5" y="3" width="5" height="18" rx="2" />
            <rect x="3" y="9.5" width="18" height="5" rx="2" />
          </svg>
        </span>
      ))}
    </div>
  );
}
