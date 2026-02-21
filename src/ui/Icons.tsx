/* ============================================================
   Icons.tsx — Lightweight inline SVG icons (no external deps)
   ============================================================ */

import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const defaults = { size: 18 };

function svg(props: IconProps, d: string, vb = '0 0 24 24') {
  const s = props.size ?? defaults.size;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox={vb}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      style={props.style}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function svgMulti(props: IconProps, children: string[], vb = '0 0 24 24') {
  const s = props.size ?? defaults.size;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox={vb}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      style={props.style}
      aria-hidden="true"
    >
      {children.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/* ---- Nav icons ---- */
export const IconHome = (p: IconProps = {}) =>
  svgMulti(p, ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10']);

export const IconEdit = (p: IconProps = {}) =>
  svgMulti(p, ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z']);

export const IconLibrary = (p: IconProps = {}) =>
  svgMulti(p, ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z']);

export const IconHistory = (p: IconProps = {}) =>
  svgMulti(p, ['M12 2a10 10 0 1 0 10 10', 'M12 6v6l4 2']);

export const IconInfo = (p: IconProps = {}) =>
  svgMulti(p, ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 16v-4', 'M12 8h.01']);

/* ---- Action icons ---- */
export const IconSun = (p: IconProps = {}) =>
  svgMulti(p, [
    'M12 2v2', 'M12 20v2', 'M4.93 4.93l1.41 1.41', 'M17.66 17.66l1.41 1.41',
    'M2 12h2', 'M20 12h2', 'M6.34 17.66l-1.41 1.41', 'M19.07 4.93l-1.41 1.41',
    'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z',
  ]);

export const IconMoon = (p: IconProps = {}) =>
  svg(p, 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');

export const IconGlobe = (p: IconProps = {}) =>
  svgMulti(p, ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M2 12h20', 'M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10A15 15 0 0 1 12 2z']);

export const IconCopy = (p: IconProps = {}) =>
  svgMulti(p, ['M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1']);

export const IconDownload = (p: IconProps = {}) =>
  svgMulti(p, ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3']);

export const IconSave = (p: IconProps = {}) =>
  svgMulti(p, ['M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', 'M17 21v-8H7v8', 'M7 3v5h8']);

export const IconRefresh = (p: IconProps = {}) =>
  svgMulti(p, ['M23 4v6h-6', 'M1 20v-6h6', 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15']);

export const IconCheck = (p: IconProps = {}) =>
  svg(p, 'M20 6L9 17l-5-5');

export const IconX = (p: IconProps = {}) =>
  svgMulti(p, ['M18 6L6 18', 'M6 6l12 12']);

export const IconPlus = (p: IconProps = {}) =>
  svgMulti(p, ['M12 5v14', 'M5 12h14']);

export const IconChevronRight = (p: IconProps = {}) =>
  svg(p, 'M9 18l6-6-6-6');

export const IconChevronLeft = (p: IconProps = {}) =>
  svg(p, 'M15 18l-6-6 6-6');

export const IconArrowRight = (p: IconProps = {}) =>
  svgMulti(p, ['M5 12h14', 'M12 5l7 7-7 7']);

export const IconArrowLeft = (p: IconProps = {}) =>
  svgMulti(p, ['M19 12H5', 'M12 19l-7-7 7-7']);

export const IconAlertTriangle = (p: IconProps = {}) =>
  svgMulti(p, ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01']);

export const IconTrash = (p: IconProps = {}) =>
  svgMulti(p, ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2']);

export const IconMenu = (p: IconProps = {}) =>
  svgMulti(p, ['M3 12h18', 'M3 6h18', 'M3 18h18']);

export const IconMail = (p: IconProps = {}) =>
  svgMulti(p, ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'M22 6l-10 7L2 6']);

export const IconMessageSquare = (p: IconProps = {}) =>
  svg(p, 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');

export const IconBug = (p: IconProps = {}) =>
  svgMulti(p, ['M9 9V4.46A2 2 0 0 1 12 3a2 2 0 0 1 3 1.46V9', 'M12 12v5', 'M8 9h8a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4z', 'M4 13h-2', 'M22 13h-2', 'M5.3 9.3l-1.4-1.4', 'M20.1 7.9l-1.4 1.4']);

export const IconUsers = (p: IconProps = {}) =>
  svgMulti(p, ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75']);

export const IconLightbulb = (p: IconProps = {}) =>
  svgMulti(p, ['M9 18h6', 'M10 22h4', 'M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z']);

export const IconShield = (p: IconProps = {}) =>
  svg(p, 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');

export const IconZap = (p: IconProps = {}) =>
  svg(p, 'M13 2L3 14h9l-1 10 10-12h-9l1-10z');

export const IconBarChart = (p: IconProps = {}) =>
  svgMulti(p, ['M12 20V10', 'M18 20V4', 'M6 20v-4']);

export const IconAccessibility = (p: IconProps = {}) =>
  svgMulti(p, ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M12 10v4', 'M9 18l3-4 3 4']);

export const IconFileText = (p: IconProps = {}) =>
  svgMulti(p, ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8']);

export const IconTarget = (p: IconProps = {}) =>
  svgMulti(p, ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z', 'M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z']);

export const IconCompass = (p: IconProps = {}) =>
  svgMulti(p, ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z']);

export const IconEye = (p: IconProps = {}) =>
  svgMulti(p, ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z']);

export const IconCheckCircle = (p: IconProps = {}) =>
  svgMulti(p, ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4L12 14.01l-3-3']);

export const IconStar = (p: IconProps = {}) =>
  svg(p, 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');

export const IconClock = (p: IconProps = {}) =>
  svgMulti(p, ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6v6l4 2']);

export const IconSkipForward = (p: IconProps = {}) =>
  svgMulti(p, ['M5 4l10 8-10 8V4z', 'M19 5v14']);

export const IconWand = (p: IconProps = {}) =>
  svgMulti(p, ['M15 4V2', 'M15 16v-2', 'M8 9h2', 'M20 9h2', 'M17.8 11.8L19 13', 'M15 9l-8.5 8.5a2.12 2.12 0 1 0 3 3L18 12', 'M12.2 6.2L11 5']);
