export const DEFAULT_CONTENT = {
    site_config: {
        siteName: "Josie's Portfolio",
        sections: [
            { id: 'about', displayName: 'About' },
            { id: 'videos', displayName: 'Videos' },
            { id: 'art', displayName: 'Art' },
            { id: 'experiments', displayName: 'Experiments' },
            { id: 'ideas', displayName: 'Ideas' }
        ]
    },
    about: { title: 'About Josie', content: 'Hi, I\'m Josie Tait.\n\nI am a director, editor and creative based in London.\n\nI work across video, art, and experimental digital projects.' },
    videos: { items: [] },
    art: { items: [] },
    experiments: { items: [] },
    ideas: { items: [] },
};

export const IS_LOCAL = process.env.NODE_ENV === 'development';
export const PORT = parseInt(process.env.PORT || '8080', 10);
// Require the user to set a real password in production (e.g., Google Cloud Run)
if (!IS_LOCAL && !process.env.ADMIN_PASSWORD) {
    console.error("CRITICAL SECURITY ERROR: ADMIN_PASSWORD environment variable is not set in production.");
    console.error("Please configure the ADMIN_PASSWORD environment variable for your deployment.");
    process.exit(1);
}

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'brownbunny'; // 'brownbunny' only applies to local dev now
export const BUCKET_NAME = process.env.GCS_BUCKET || 'josie-portfolio-content';
