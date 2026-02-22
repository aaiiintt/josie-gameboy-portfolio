import { getContrastTextColor } from '../utils/colors';

export interface SectionColorDef {
  id: string;
  label: string;
  color: string;
  colorDeep: string;
}

interface ReceiptHeaderProps {
  siteName?: string;
  sections?: SectionColorDef[];
}

const DEFAULT_SECTIONS: SectionColorDef[] = [
  { id: 'about', label: 'ABOUT', color: 'var(--pink)', colorDeep: 'var(--pink-deep)' },
  { id: 'videos', label: 'VIDEOS', color: 'var(--blue)', colorDeep: 'var(--blue-deep)' },
  { id: 'art', label: 'ART', color: 'var(--cream)', colorDeep: 'var(--cream-deep)' },
  { id: 'experiments', label: 'EXPERIMENTS', color: 'var(--lavender)', colorDeep: 'var(--lav-deep)' },
  { id: 'ideas', label: 'IDEAS', color: 'var(--mint)', colorDeep: 'var(--mint-deep)' },
];

export function ReceiptHeader({ siteName = 'JOSIE TAIT', sections = DEFAULT_SECTIONS }: ReceiptHeaderProps) {
  return (
    <header className="site-header">
      {/* Site name */}
      <a
        href="#"
        className="font-display text-[0.55rem] tracking-widest whitespace-nowrap uppercase"
        style={{ color: 'var(--dark)', textDecoration: 'none' }}
      >
        {siteName}
      </a>

      {/* Nav links */}
      <nav className="flex flex-wrap gap-1 md:gap-2 justify-end">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="nav-link"
            style={{
              background: s.color,
              borderColor: s.colorDeep,
              color: getContrastTextColor(s.color),
            }}
          >
            {s.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

