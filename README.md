# Josie's Portfolio

A highly interactive, dynamic React portfolio backed by an integrated Express admin panel. This system utilizes a bespoke JSON-powered Content Management System (CMS) that persists data either entirely locally for incredibly fast development or streams transparently into Google Cloud Storage for global production deployments.

## Key Features

- **Interactive 3D Elements:** Leverages Three.js and `@react-three/fiber` alongside GSAP for deeply visceral and immersive animations.
- **Dynamic Configuration & CMS:** A protected, built-in `/admin` dashboard that orchestrates drag-and-drop structural organization, dynamic top-level global settings (like site names and theme colors), and secure media file uploads.
- **Lightweight Architecture:** Eliminates the need for Postgres or complex traditional databases. The repository manages data via local `.json` documents which map directly into isolated Cloud Storage buckets upon production deployment.
- **Zero-Downtime Deployment:** Includes configured GitHub Actions workflows for Workload Identity Federation building standard Docker containers directly to Google Cloud Run.

---

## Tech Stack

- **Language**: TypeScript / Node.js 20+
- **Frontend Framework**: React 19 via Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI Primitives (Accessible, Unstyled Components)
- **Animations / 3D**: GSAP, React Three Fiber
- **Backend API**: Express
- **Storage / Database**: Flat JSON Files & Google Cloud Storage
- **Deployment**: Google Cloud Run & Artifact Registry

---

## Prerequisites

- **Node.js**: v20 or higher
- **NPM**
- (Optional, Production Only) **Google Cloud Project** for Cloud Storage buckets and Cloud Run artifact registries.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aaiiintt/josie-gameboy-portfolio.git
cd josie-gameboy-portfolio
```

### 2. Install Dependencies

You need to establish all of the dependencies for both the Express Server and the Vite React scaffolding. Due to the architecture, these commands exist in a singular `package.json`.

```bash
npm install
```

### 3. Environment Setup

Running locally requires virtually no specific layout because the application is designed to gracefully fallback to using exact physical representations of JSON schemas and `public/uploads` directories rather than calling the cloud on native processes.

However, to safely administer the CMS Dashboard, you will want an `ADMIN_PASSWORD`. 
Create a `.env` file or export this inline when beginning your instance.

```bash
# Example local execution with the admin dashboard unlocked
ADMIN_PASSWORD="supersecretpassword" npm run dev
```

### 4. Start Development Server

The repository leverages `concurrently` to orchestrate both the Vite HMR server and the Express API. Start both using:

```bash
npm run dev
```

- Open the Main Frontend Portfolio: [http://localhost:5173/](http://localhost:5173/)
- Open the Admin Dashboard: [http://localhost:5173/admin/index.html](http://localhost:5173/admin/index.html) _(Requests the standard `ADMIN_PASSWORD` you provided on start)_

---

## Architecture

### Directory Structure

```
├── .github/          # GitHub Action Workflows for Cloud Run deployment 
├── public/           # Static global assets (Fonts, favicons, etc)
│ └── admin/          # Admin Dashboard Vanilla JS / HTML shell
├── server/           # Express Backend Logic
│ ├── config.js       # Runtime evaluation flags and Default System Layouts
│ ├── index.js        # Main express server entry point
│ ├── routes/api.js   # Authorization checks, dynamic JSON CMS routing
│ └── services/storage.js # Multiplexed module resolving Local vs Cloud Storage
├── src/              # React Application 
│ ├── components/     # UI Level Shared Components (Radix UI pieces)
│ ├── content/        # The Local Sandbox Database (JSON files)
│ ├── lib/            # Utility and helper functions
│ ├── sections/       # Primary Route and Page structures (e.g., ReceiptHeader)
│ ├── App.tsx         # The main iterative configuration tree logic
│ └── main.tsx        # React mounting bootstrap
├── Dockerfile        # The multi-stage lightweight build runner
└── vite.config.ts    # Frontend routing and port mappings
```

### Request Lifecycle

1. **User Client** pings `http://your-app/`.
2. App performs a standard **Fetch** intercepting React context hitting `/api/content/site_config`.
3. The Express Backend analyzes structural `site_config.json` instructions. 
4. The system iterates returning dedicated JSON manifests for individual active pages.
5. The React App orchestrates the dynamic hierarchy via specific UI Section configurations utilizing global Tailwind colors and dynamic GSAP instances.

### The Admin Content Management System

The core design philosophy rests heavily on absolute user mutability. Using the `public/admin/index.html` interface with your securely allocated `ADMIN_PASSWORD`:
- Users can dynamically reorder the structure of pages and inject custom accent colors deeply affecting contrast checks entirely inside memory without physically rewriting React logic.
- Adding cards physically executes Multer file stream arrays mapping data via `POST` routes natively into static JS structures or up into scalable backend architecture.

---

## Environment Variables

### Required (Production)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `GCS_BUCKET` | The Google Cloud Storage bucket tracking your media. | `josie-portfolio-content` |
| `ADMIN_PASSWORD` | The password required to manipulate the CMS. | `[Redacted]` |

*(In local environments lacking an overarching `GCS_BUCKET` configuration, `server/config.js` intelligently forces Local Fallbacks mapping images and configs straight toward the `src/content/` files.)*

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Spins up both Vite (Frontend) and Express (API) contexts concurrently with pretty logging loops. |
| `npm run build` | Compiles a production-grade Vite payload outputted dynamically mapped against `tsc`. |
| `npm run start` | Activates solely the Express payload instance. Utilized heavily inside the Docker Runtime. |
| `npm run lint` | Fires standard formatting analysis using ESLint |

---

## Deployment

The platform embraces a multi-stage Docker container natively executing inside **Google Cloud Run** with images handled through **Artifact Registry**.

### Automated Deployments (GitHub Actions)

Deployments are strictly automated via GitHub `.github/workflows/deploy.yml`. 

Your GitHub repository must configure:
1. `WIF_PROVIDER` (Google Cloud Workload Identity Federation configuration)
2. `WIF_SERVICE_ACCOUNT` (Authorized IAM Email mapping your pipeline)
3. `ADMIN_PASSWORD` as a repository secret

The pipeline will trigger automatically upon updating `main`:

```yaml
# Step example in deploy.yml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy ${{ env.SERVICE_NAME }} \
      --image "$IMAGE" \
      --region ${{ env.REGION }} \
      --platform managed \
      --allow-unauthenticated \
      --set-env-vars "GCS_BUCKET=josie-portfolio-content,ADMIN_PASSWORD=${{ secrets.ADMIN_PASSWORD }}" \
      --project ${{ env.PROJECT_ID }}
```

### Manual Docker Validation

You can validate exactly what Cloud Run executes locally. 

```bash
# Build the payload
docker build -t josie/portfolio .

# Execute isolated inside port 8080 targeting purely simulated Production flags
docker run -p 8080:8080 -e NODE_ENV=production -e ADMIN_PASSWORD=localtest josie/portfolio
```

---

## Troubleshooting

### Uploads Fail via Admin Panel
**Error:** `Failed to read or write local configurations. API routes return 500.`
**Solution:** Check local disk permissions for the user account inside the underlying `public/uploads` directory. The multer proxy demands standard `r/w` disk authorization unless routing purely toward a mapped `GCS_BUCKET`.

### Cloud Run Container Fails to Build
**Error:** `Cannot find module dependencies or missing dev rules.`
**Solution:** Check `server/index.js` pathing. Ensure the Express layer correctly targets fallback dependencies in a post-build environment. Note the Dockerfile strips developer dependencies `npm ci --omit=dev`, therefore your project must ensure frontend UI requirements compile thoroughly inside the `builder` stage layer safely inside the `dist` array.
