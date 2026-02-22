import { useEffect, useState } from 'react';
import { ReceiptHeader } from './sections/ReceiptHeader';
import { HorizontalScrollSection } from './components/HorizontalScrollSection';
import { PortfolioCard } from './components/PortfolioCard';
import { PortfolioSection } from './components/PortfolioSection';
import './App.css';
import { getDeepColor } from './utils/colors';

import { API_BASE, SESSION_CACHE_BUSTER } from './config';

const COLOR_PALETTES = [
  { accentColor: '#f4a7c3', accentColorDeep: '#e07fa8' }, // Pink
  { accentColor: '#9bc4e8', accentColorDeep: '#6aa5d4' }, // Blue
  { accentColor: '#f9e4b7', accentColorDeep: '#e8c97a' }, // Yellow
  { accentColor: '#c4b5e8', accentColorDeep: '#9c88d4' }, // Purple
  { accentColor: '#b5e8c4', accentColorDeep: '#7acc96' }, // Green
  { accentColor: '#f4b5a7', accentColorDeep: '#e08a7f' }, // Peach
];

// ── Types ────────────────────────────────────────────────────────────────────
interface ContentItem {
  id: string;
  title: string;
  description: string;
  mediaPath?: string;
  mediaType?: 'image' | 'video';
}

interface SectionData {
  title?: string;
  content?: string;
  items?: ContentItem[];
  accentColor?: string;
}

interface SiteConfig {
  siteName: string;
  sections: { id: string; displayName: string }[];
}

// ── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ background: '#fef6fb' }}
    >
      <div
        className="w-48 h-4 rounded-full overflow-hidden border-2"
        style={{ borderColor: 'var(--pink-deep)', background: '#f9e4b7' }}
      >
        <div
          className="loading-bar h-full animate-pulse"
          style={{ background: 'var(--pink)', width: '70%' }}
        />
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [content, setContent] = useState<Record<string, SectionData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for CMS admin route
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/index.html';
      return;
    }

    // First fetch global site config
    fetch(`${API_BASE}/api/content/site_config`)
      .then(r => r.json())
      .then((config: SiteConfig) => {
        setSiteConfig(config);

        // Then fetch all active sections
        return Promise.all(
          config.sections.map((s) =>
            fetch(`${API_BASE}/api/content/${s.id}`)
              .then((r) => {
                if (!r.ok) throw new Error(`${r.status}`);
                return r.json();
              })
              .then((data) => [s.id, data] as [string, SectionData])
              .catch(() => [s.id, {}] as [string, SectionData])
          )
        );
      })
      .then((results) => {
        const merged: Record<string, SectionData> = {};
        if (results) {
          results.forEach(([key, val]) => {
            merged[key] = val;
          });
        }
        setContent(merged);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load site config", err);
        setLoading(false);
      });
  }, []);

  if (loading || !siteConfig) return <LoadingScreen />;

  const headerSections = siteConfig.sections.map((section, idx) => {
    const data = content[section.id] || {};
    const palette = COLOR_PALETTES[idx % COLOR_PALETTES.length];

    return {
      id: section.id,
      label: section.displayName.toUpperCase(),
      color: data.accentColor || palette.accentColor,
      colorDeep: data.accentColor ? getDeepColor(data.accentColor) : palette.accentColorDeep
    };
  });

  return (
    <>
      <ReceiptHeader siteName={siteConfig.siteName} sections={headerSections} />

      {siteConfig.sections.map((section, idx) => {
        const data = content[section.id] || {};
        const palette = COLOR_PALETTES[idx % COLOR_PALETTES.length];

        const activeColor = data.accentColor || palette.accentColor;
        const activeColorDeep = data.accentColor ? getDeepColor(data.accentColor) : palette.accentColorDeep;
        const bgSrc = `${API_BASE}/backgrounds/${section.id}.png${SESSION_CACHE_BUSTER}`;

        // The "about" section requires a custom layout with the text block
        if (section.id === 'about') {
          return (
            <HorizontalScrollSection
              key={section.id}
              id={section.id}
              backgroundSrc={bgSrc}
              accentColor={activeColor}
              accentColorDeep={activeColorDeep}
            >
              <PortfolioCard
                title={data.title ?? 'About'}
                accentColor={activeColor}
                accentColorDeep={activeColorDeep}
              >
                <div className="whitespace-pre-wrap">{data.content}</div>
              </PortfolioCard>
            </HorizontalScrollSection>
          );
        }

        // Generic sections using the PortfolioSection abstraction
        return (
          <PortfolioSection
            key={section.id}
            config={{
              id: section.id,
              label: section.displayName.toUpperCase(),
              backgroundSrc: bgSrc,
              accentColor: activeColor,
              accentColorDeep: activeColorDeep,
            }}
            data={data}
          />
        );
      })}
    </>
  );
}
