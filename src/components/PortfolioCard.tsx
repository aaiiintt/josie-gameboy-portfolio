import React from 'react';
import { getContrastTextColor } from '../utils/colors';

interface PortfolioCardProps {
  title: string;
  subtitle?: string;
  mediaPath?: string;
  mediaType?: 'image' | 'video';
  accentColor?: string;
  accentColorDeep?: string;
  children: React.ReactNode;
}

export function PortfolioCard({
  title,
  mediaPath,
  mediaType = 'image',
  accentColor = '#f4a7c3',
  accentColorDeep = '#e07fa8',
  children,
}: PortfolioCardProps) {
  return (
    <div
      className="portfolio-card flex flex-col overflow-hidden mb-6"
      style={{ minHeight: 380, maxHeight: 560, height: '65vh' }}
    >
      {/* Accent header bar */}
      <div
        className="card-header flex-shrink-0"
        style={{
          background: accentColor,
          borderBottomColor: accentColorDeep,
          color: getContrastTextColor(accentColor)
        }}
      >
        {title}
      </div>

      {/* Dashed divider */}
      <hr className="dashed-line mx-4 flex-shrink-0" />

      {/* Media */}
      {mediaPath && (
        <div className="flex-shrink-0 px-4 mb-2">
          {mediaType === 'image' ? (
            <img
              src={mediaPath}
              alt={title}
              className="w-full rounded-lg object-cover border-4"
              style={{ height: 200, borderColor: accentColorDeep }}
            />
          ) : (
            <video
              src={mediaPath}
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-lg object-cover border-4"
              style={{ height: 200, borderColor: accentColorDeep }}
            />
          )}
        </div>
      )}

      {/* Scrollable text content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 font-mono text-sm leading-relaxed" style={{ color: 'var(--dark)' }}>
        {children}
      </div>
    </div>
  );
}
