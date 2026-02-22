import { HorizontalScrollSection } from './HorizontalScrollSection';
import { PortfolioCard } from './PortfolioCard';
import { resolveMedia } from '../utils/media';

interface SectionConfig {
    id: string;
    label?: string;
    backgroundSrc: string;
    accentColor: string;
    accentColorDeep: string;
}

interface PortfolioSectionProps {
    config: SectionConfig;
    data: any;
}

/**
 * Generic Portfolio Section
 * Removes DRY violations spanning hundreds of lines in App.tsx by abstracting
 * the exact same HorizontalScroll mapping logic dynamically based on data.
 */
export function PortfolioSection({ config, data }: PortfolioSectionProps) {
    if (!data?.items?.length && config.id !== 'about') return null;

    return (
        <HorizontalScrollSection
            id={config.id}
            backgroundSrc={config.backgroundSrc}
            accentColor={config.accentColor}
            accentColorDeep={config.accentColorDeep}
        >
            {data?.items?.map((item: any, idx: number) => {
                const title = typeof item === 'string' ? item : item.title || `Item ${idx + 1}`;
                const media = typeof item === 'object' && item.media_file ? resolveMedia(item.media_file) : undefined;
                // Basic heuristic: if it contains an audio/video extension, treat as video
                const mediaType = media && /\.(mp4|webm|mov|ogg)$/i.test(media) ? 'video' : 'image';
                const description = typeof item === 'object' ? item.description : undefined;

                return (
                    <PortfolioCard
                        key={idx}
                        title={title}
                        mediaPath={media}
                        mediaType={mediaType}
                        accentColor={config.accentColor}
                        accentColorDeep={config.accentColorDeep}
                    >
                        {description ? <p>{description}</p> : null}
                    </PortfolioCard>
                );
            })}
        </HorizontalScrollSection>
    );
}
