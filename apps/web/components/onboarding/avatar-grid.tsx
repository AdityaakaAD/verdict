'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AVATAR_IDS, type AvatarId } from '@verdict/shared';

interface Props {
  selected: AvatarId | null;
  onSelect: (id: AvatarId) => void;
}

export function AvatarGrid({ selected, onSelect }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Avatar"
      className="grid grid-cols-6 gap-2 sm:grid-cols-8"
    >
      {AVATAR_IDS.map((id) => {
        const isSelected = selected === id;
        return (
          <motion.button
            key={id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(id)}
            whileTap={{ scale: 0.9 }}
            animate={isSelected ? { scale: [1, 1.15, 1.0] } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="flex aspect-square items-center justify-center rounded-md transition-colors duration-100"
            style={{
              border: isSelected
                ? '1.5px solid var(--accent)'
                : '0.5px solid var(--border-subtle)',
              background: isSelected ? 'rgba(255,59,48,0.06)' : 'var(--bg-secondary)',
            }}
          >
            <AvatarShape id={id} active={isSelected} />
          </motion.button>
        );
      })}
    </div>
  );
}

function AvatarShape({ id, active }: { id: AvatarId; active: boolean }) {
  const color = active ? 'var(--accent)' : 'var(--text-secondary)';
  const s = 20; // viewBox size
  const c = s / 2; // center

  const shapeMap: Record<AvatarId, React.ReactNode> = {
    circle: (
      <circle cx={c} cy={c} r={7} fill="none" stroke={color} strokeWidth={1.5} />
    ),
    triangle: (
      <polygon points="10,16 10,4 20,10" fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    ),
    square: (
      <rect x={4} y={4} width={12} height={12} fill="none" stroke={color} strokeWidth={1.5} />
    ),
    pentagon: (
      <polygon
        points="10,3 17.5,8 15,16 5,16 2.5,8"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    ),
    hexagon: (
      <polygon
        points="10,2 17,6 17,14 10,18 3,14 3,6"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    ),
    octagon: (
      <polygon
        points="6,2 14,2 18,6 18,14 14,18 6,18 2,14 2,6"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    ),
    diamond: (
      <polygon
        points="10,2 18,10 10,18 2,10"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    ),
    star: (
      <polygon
        points="10,2 12.1,7.5 18,7.5 13.5,11 15.1,17 10,13.5 4.9,17 6.5,11 2,7.5 7.9,7.5"
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    ),
    crescent: (
      <path
        d="M 13,4 A 7,7 0 1 0 13,16 A 5,5 0 1 1 13,4 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    ),
    arrow: (
      <path
        d="M 4,10 L 16,10 M 12,6 L 16,10 L 12,14"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    spiral: (
      <path
        d="M 10,10 Q 10,5 13,7 Q 16,10 13,13 Q 10,16 7,13 Q 4,10 7,7 Q 10,4 14,5"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    ),
    cross: (
      <path
        d="M 10,3 L 10,17 M 3,10 L 17,10"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    ),
    wave: (
      <path
        d="M 2,10 Q 5,6 8,10 Q 11,14 14,10 Q 17,6 20,10"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    ),
    flame: (
      <path
        d="M 10,17 C 5,15 4,11 6,8 C 6,11 8,11 8,8 C 9,5 11,4 10,2 C 13,5 15,9 14,12 C 14,10 12,10 13,8 C 15,12 14,16 10,17 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    ),
    leaf: (
      <path
        d="M 10,17 C 3,14 3,6 10,3 C 17,6 17,14 10,17 Z M 10,3 L 10,17"
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    ),
    mountain: (
      <path
        d="M 2,16 L 7,7 L 10,11 L 13,6 L 18,16 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    ),
    eye: (
      <>
        <path
          d="M 2,10 Q 10,4 18,10 Q 10,16 2,10 Z"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <circle cx={10} cy={10} r={2.5} fill="none" stroke={color} strokeWidth={1.2} />
      </>
    ),
    key: (
      <>
        <circle cx={7} cy={8} r={4} fill="none" stroke={color} strokeWidth={1.5} />
        <path
          d="M 10,10 L 17,17 M 15,15 L 17,13 M 13,17 L 15,15"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </>
    ),
    feather: (
      <path
        d="M 5,15 Q 8,12 10,10 Q 14,6 16,4 C 14,8 12,9 11,12 Q 13,9 15,7 Q 12,12 10,14 L 5,15 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    ),
    thread: (
      <>
        <ellipse cx={10} cy={10} rx={5} ry={7} fill="none" stroke={color} strokeWidth={1.5} />
        <line x1={10} y1={3} x2={10} y2={17} stroke={color} strokeWidth={1.2} />
        <line x1={5} y1={10} x2={15} y2={10} stroke={color} strokeWidth={1.2} />
      </>
    ),
    compass: (
      <>
        <circle cx={10} cy={10} r={7} fill="none" stroke={color} strokeWidth={1.5} />
        <polygon points="10,4 11.5,10 10,13 8.5,10" fill={color} />
        <polygon points="10,16 8.5,10 10,7 11.5,10" fill="none" stroke={color} strokeWidth={1} />
      </>
    ),
    gavel: (
      <>
        <rect
          x={6} y={4} width={8} height={5}
          rx={1}
          transform="rotate(-45 10 6.5)"
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        />
        <line
          x1={8} y1={12} x2={4} y2={16}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </>
    ),
    scales: (
      <>
        <line x1={10} y1={3} x2={10} y2={14} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <line x1={5} y1={7} x2={15} y2={7} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <line x1={5} y1={7} x2={5} y2={12} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        <line x1={15} y1={7} x2={15} y2={11} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        <path d="M 2,12 Q 5,15 8,12" fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        <path d="M 12,11 Q 15,14 18,11" fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        <line x1={7} y1={14} x2={13} y2={14} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </>
    ),
    lantern: (
      <>
        <rect x={7} y={6} width={6} height={9} rx={1} fill="none" stroke={color} strokeWidth={1.5} />
        <line x1={10} y1={3} x2={10} y2={6} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <line x1={10} y1={15} x2={10} y2={17} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <line x1={7} y1={10} x2={13} y2={10} stroke={color} strokeWidth={1} />
      </>
    ),
  };

  const shape = shapeMap[id];

  return (
    <svg viewBox="0 0 20 20" width={20} height={20} fill="none" aria-hidden>
      {shape}
    </svg>
  );
}
