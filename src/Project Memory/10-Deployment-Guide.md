# Deployment Guide

This guide outlines setup, local execution, and production build instructions for Health Sakhi.

## Prerequisites
- **Node.js:** v18.x or higher recommended
- **npm:** v9.x or higher

---

## 🛠️ Local Development

### 1. Install Dependencies
Run the installation command in the root folder of the project:
```bash
npm install
```

### 2. Start the Development Server
Run the dev script to spin up the local server with hot reloading:
```bash
npm run dev
```
The application will default to running on: `http://localhost:5173/`

---

## 🚀 Production Deployment

### 1. Build Compilation
Compile the optimized production bundle:
```bash
npm run build
```
This generates optimized HTML, CSS, and JS assets in the `/dist` directory.

### 2. Preview the Build Locally
To test the production build locally before actual deployment, run:
```bash
npm run preview
```

### 3. Deployment Targets
- **Netlify:** The project includes a configured `netlify.toml` file in the root directory. To deploy:
  - Connect the Git repository to Netlify.
  - Set the build command to `npm run build` and publish directory to `dist`.
  - Set routing redirect fallback rules (handled automatically by `netlify.toml`).
