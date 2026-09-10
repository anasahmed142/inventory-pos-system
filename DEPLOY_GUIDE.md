# 🚀 100% FREE Live Deployment Guide

This project is fully pre-configured for instant **Zero-Cost (100% FREE Forever)** hosting on **Firebase Hosting**, **Vercel**, or **GitHub Pages**.

---

## ⚡ Option 1: Firebase Hosting (100% Free - Recommended)

Firebase provides **10 GB of storage**, **free SSL**, **custom domains**, and **global fast CDN** on the Free (Spark) plan with **$0 / month** charges.

### Step 1: Open Terminal in this folder
Run the following in PowerShell / Command Prompt:

```powershell
# 1. Login to your Google / Firebase account (opens browser)
npx firebase-tools login

# 2. Initialize Firebase Hosting
npx firebase-tools init hosting
```

### Step 2: Answer the interactive prompts:
- **Please select an option**: Select `Use an existing project` (choose your project) or `Create a new project`.
- **What do you want to use as your public directory?**: Type `apps/web/dist` and press Enter.
- **Configure as a single-page app (rewrite all urls to /index.html)?**: Type `y` (Yes) and press Enter.
- **Set up automatic builds and deploys with GitHub?**: Type `n` (or `y` if you want GitHub Actions).
- **File apps/web/dist/index.html already exists. Overwrite?**: Type `N` (No) and press Enter.

### Step 3: Deploy to Live URL
```powershell
npx firebase-tools deploy --only hosting
```

🎉 **Done!** Firebase will output your live URL:
`https://<your-project-id>.web.app` or `https://<your-project-id>.firebaseapp.com`

---

## ⚡ Option 2: Push to GitHub & 1-Click Vercel (100% Free)

Vercel provides **100 GB bandwidth / month**, **instant automated deployments on `git push`**, and **zero maintenance**.

### Step 1: Create a New Repo on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `inventory-pos-system`).
3. Leave it **Public** or **Private** and click **Create repository**.

### Step 2: Push your code to GitHub
Run these commands in PowerShell:

```powershell
# Add your GitHub repository remote
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# Push the main branch
git push -u origin main
```

### Step 3: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and Sign In with GitHub.
2. Click **Add New...** -> **Project**.
3. Select your `inventory-pos-system` repository and click **Import**.
4. Vercel will automatically detect the pre-configured `vercel.json` and build `apps/web/dist`.
5. Click **Deploy**.

🎉 **Done!** Your app will be live within 60 seconds with an HTTPS URL like `https://inventory-pos-system.vercel.app`.

---

## 🛡️ Zero-Cost Guarantee
- **IndexedDB & Local Storage**: All business data, offline transactions, and settings operate client-side in the browser and sync seamlessly, requiring $0 for database servers.
- **No Paid APIs Required**: Excel export/import, thermal print rasterization, WhatsApp web links, and FBR receipt formatting execute in the client browser with zero API billing.
