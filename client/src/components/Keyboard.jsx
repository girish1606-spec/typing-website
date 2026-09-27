import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const KEYBOARD_ROWS = [
  [
    { key: '`', shift: '~', width: 'w-10' },
    { key: '1', shift: '!' },
    { key: '2', shift: '@' },
    { key: '3', shift: '#' },
    { key: '4', shift: '$' },
    { key: '5', shift: '%' },
    { key: '6', shift: '^' },
    { key: '7', shift: '&' },
    { key: '8', shift: '*' },
    { key: '9', shift: '(' },
    { key: '0', shift: ')' },
    { key: '-', shift: '_' },
    { key: '=', shift: '+' },
    { key: 'Backspace', display: 'Bksp', width: 'w-16 sm:w-20' },
  ],
  [
    { key: 'Tab', display: 'Tab', width: 'w-14 sm:w-16' },
    { key: 'q' }, { key: 'w' }, { key: 'e' }, { key: 'r' }, { key: 't' },
    { key: 'y' }, { key: 'u' }, { key: 'i' }, { key: 'o' }, { key: 'p' },
    { key: '[', shift: '{' },
    { key: ']', shift: '}' },
    { key: '\\', shift: '|', width: 'w-12' },
  ],
  [
    { key: 'CapsLock', display: 'Caps', width: 'w-16 sm:w-20' },
    { key: 'a' }, { key: 's' }, { key: 'd' }, { key: 'f' }, { key: 'g' },
    { key: 'h' }, { key: 'j' }, { key: 'k' }, { key: 'l' },
    { key: ';', shift: ':' },
    { key: "'", shift: '"' },
    { key: 'Enter', display: 'Enter', width: 'w-16 sm:w-20' },
  ],
  [
    { key: 'Shift', display: 'Shift', width: 'w-20 sm:w-24' },
    { key: 'z' }, { key: 'x' }, { key: 'c' }, { key: 'v' }, { key: 'b' },
    { key: 'n' }, { key: 'm' },
    { key: ',', shift: '<' },
    { key: '.', shift: '>' },
    { key: '/', shift: '?' },
    { key: 'Shift', display: 'Shift', width: 'w-20 sm:w-24' },
  ],
  [
    { key: 'Control', display: 'Ctrl', width: 'w-14' },
    { key: 'Alt', display: 'Alt', width: 'w-14' },
    { key: ' ', display: 'Space', width: 'flex-1 max-w-sm' },
    { key: 'Alt', display: 'Alt', width: 'w-14' },
    { key: 'Control', display: 'Ctrl', width: 'w-14' },
  ]
];

export function Keyboard({ activeKey = '', targetKey = '' }) {
  const { settings } = useTheme();

  // Settings custom classes
  const shapeClass =
    settings.keyShape === 'pill'
      ? 'rounded-full'
      : settings.keyShape === 'sharp'
      ? 'rounded-none'
      : 'rounded-lg';

  const sizeClass =
    settings.keySize === 'compact'
      ? 'h-8 sm:h-9 text-xs'
      : settings.keySize === 'large'
      ? 'h-12 sm:h-14 text-base'
      : 'h-10 sm:h-11 text-xs sm:text-sm';

  const spacingClass =
    settings.keySpacing === 'tight'
      ? 'gap-1 my-1'
      : settings.keySpacing === 'relaxed'
      ? 'gap-2 my-2'
      : 'gap-1.5 my-1.5';

  const normalizeKey = (k) => {
    if (!k) return '';
    if (k === ' ') return ' ';
    return k.toLowerCase();
  };

  const isKeyActive = (keyDef) => {
    const act = normalizeKey(activeKey);
    if (!act) return false;
    if (keyDef.key === ' ' && act === ' ') return true;
    if (normalizeKey(keyDef.key) === act) return true;
    if (keyDef.shift && normalizeKey(keyDef.shift) === act) return true;
    return false;
  };

  const isKeyTarget = (keyDef) => {
    const tgt = normalizeKey(targetKey);
    if (!tgt) return false;
    if (keyDef.key === ' ' && tgt === ' ') return true;
    if (normalizeKey(keyDef.key) === tgt) return true;
    if (keyDef.shift && normalizeKey(keyDef.shift) === tgt) return true;
    return false;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-5 rounded-2xl glass-panel shadow-2xl border select-none overflow-x-auto">
      <div className="flex flex-col items-center min-w-[620px]">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className={`flex justify-center w-full ${spacingClass}`}>
            {row.map((k, colIndex) => {
              const active = isKeyActive(k);
              const target = isKeyTarget(k);
              const keyWidth = k.width || 'w-8 sm:w-10';

              return (
                <div
                  key={`${rowIndex}-${colIndex}-${k.key}`}
                  className={`
                    keycap flex items-center justify-center font-mono font-medium relative
                    ${keyWidth} ${sizeClass} ${shapeClass}
                    ${active ? 'pressed ring-2 ring-sky-400 bg-sky-400 text-slate-950 font-bold' : ''}
                    ${target && !active ? 'target-key ring-1 ring-sky-400/80 bg-sky-950/40 text-sky-200' : ''}
                  `}
                >
                  <span className="capitalize">{k.display || k.key}</span>
                  {(k.key === 'f' || k.key === 'j') && (
                    <span className="absolute bottom-1 w-2.5 h-[2px] bg-slate-500/60 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
