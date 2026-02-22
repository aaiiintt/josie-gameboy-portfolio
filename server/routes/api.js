import { Router } from 'express';
import crypto from 'crypto';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { loginHandler, requireAuth } from '../middleware/auth.js';
import { IS_LOCAL } from '../config.js';
import { readContent, writeContent, upload, uploadToGCS } from '../services/storage.js';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many uploads from this IP, please try again after a minute' }
});

// ── Auth Endpoints ────────────────────────────────────────────────────────────
router.post('/auth/login', loginLimiter, loginHandler);

router.get('/auth/verify', requireAuth, (req, res) => {
    res.json({ ok: true });
});

// ── Content CRUD Endpoints ────────────────────────────────────────────────────
router.get('/content/:section', async (req, res) => {
    const { section } = req.params;
    if (!/^[a-zA-Z0-9_-]+$/.test(section)) return res.status(400).json({ error: 'Invalid section name' });
    try {
        res.json(await readContent(section));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read content' });
    }
});

router.post('/content/:section', requireAuth, async (req, res) => {
    const { section } = req.params;
    if (!/^[a-zA-Z0-9_-]+$/.test(section)) return res.status(400).json({ error: 'Invalid section name' });
    try {
        await writeContent(section, req.body);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to write content' });
    }
});

// ── Upload Endpoints ──────────────────────────────────────────────────────────
router.post('/upload', requireAuth, uploadLimiter, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });

        if (IS_LOCAL) {
            // File already saved to disk by multer diskStorage
            const url = `/uploads/${req.file.filename}`;
            return res.json({ url });
        }

        // Production: stream to GCS
        const ext = extname(req.file.originalname).toLowerCase();
        const filename = crypto.randomBytes(8).toString('hex') + ext;
        const url = await uploadToGCS('uploads', filename, req.file.buffer, req.file.mimetype);
        res.json({ url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

router.post('/upload/background/:section', requireAuth, uploadLimiter, upload.single('file'), async (req, res) => {
    try {
        const { section } = req.params;
        if (!/^[a-zA-Z0-9_-]+$/.test(section)) return res.status(400).json({ error: 'Invalid section name' });
        if (!req.file) return res.status(400).json({ error: 'No file provided' });

        if (IS_LOCAL) {
            const { copyFile, mkdir } = await import('fs/promises');
            const bgDir = join(__dirname, '../../public/backgrounds');
            await mkdir(bgDir, { recursive: true });
            const dest = join(bgDir, `${section}.png`);
            await copyFile(req.file.path, dest);
            const url = `/backgrounds/${section}.png`;
            return res.json({ url });
        }

        // Production: upload to GCS and return URL
        const url = await uploadToGCS('backgrounds', `${section}.png`, req.file.buffer, req.file.mimetype);
        res.json({ url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Background upload failed' });
    }
});

export default router;
