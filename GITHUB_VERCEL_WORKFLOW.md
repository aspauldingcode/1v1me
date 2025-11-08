# 🔄 GitHub + Vercel: Automatic Deployment Workflow

This guide explains how GitHub and Vercel work together for automatic deployments.

## How It Works

```
Your Computer → GitHub → Vercel → Live Website
    (push)      (sync)   (build)   (deploy)
```

Once you've connected Vercel to your GitHub repository, every `git push` automatically triggers a deployment!

## Initial Setup (One Time Only)

### Step 1: Connect to GitHub
```bash
# Already done! ✅
git remote add origin git@github.com:aspauldingcode/1v1me.git
git push -u origin master
```

### Step 2: Connect to Vercel
```bash
# Run once to connect
vercel login
vercel
vercel --prod
```

**That's it!** Automatic deployments are now enabled.

---

## Daily Workflow: Making Changes

### 1. Make Your Code Changes
```bash
cd /Users/alex/1v1me
# Edit your files...
```

### 2. Commit Your Changes
```bash
git add .
git commit -m "Add new feature"
```

### 3. Push to GitHub
```bash
git push
```

### 4. Watch Vercel Deploy Automatically! 🚀

**What happens automatically:**
1. ✅ GitHub receives your push
2. ✅ Vercel detects the change via webhook
3. ✅ Vercel starts building your project
4. ✅ Vercel runs tests (if configured)
5. ✅ Vercel deploys to production
6. ✅ You get a notification when done!

**No need to run `vercel` command again!**

---

## Deployment Types

### Production Deployment (master branch)
```bash
git checkout master
git push  # → Deploys to https://1v1me.vercel.app
```

### Preview Deployment (Pull Requests)
```bash
git checkout -b feature/new-design
# Make changes...
git push origin feature/new-design
# Create PR on GitHub → Gets unique preview URL
```

---

## Monitoring Deployments

### Option 1: Vercel Dashboard
Visit: https://vercel.com/dashboard
- See all deployments
- View build logs
- Check deployment status

### Option 2: GitHub Integration
- Each commit shows Vercel deployment status
- Click "View deployment" in GitHub checks
- Preview deployments appear in PR comments

### Option 3: Email Notifications
You'll receive emails for:
- ✅ Successful deployments
- ❌ Failed deployments
- 🔍 Build errors

---

## Example Workflow

```bash
# 1. Make a change to your homepage
cd /Users/alex/1v1me/frontend/app
nano page.tsx  # Edit the file

# 2. Save and test locally
cd /Users/alex/1v1me/frontend
npm run dev  # Test at http://localhost:3000

# 3. Commit and push
cd /Users/alex/1v1me
git add .
git commit -m "Update homepage hero section"
git push

# 4. Watch it deploy!
# Visit https://vercel.com/dashboard to see live build
# Or check your email for deployment notification
# Visit https://1v1me.vercel.app to see live changes (in ~30 seconds)
```

---

## Useful Commands

### Check Git Status
```bash
git status          # See what changed
git log --oneline   # See recent commits
git remote -v       # Verify GitHub connection
```

### Vercel Commands (Optional)
```bash
vercel ls           # List all deployments
vercel logs         # View deployment logs
vercel inspect      # Inspect latest deployment
vercel --prod       # Manual production deployment
```

### Rollback (If Needed)
```bash
# Via Git
git revert HEAD     # Revert last commit
git push            # Push revert (auto-deploys old version)

# Via Vercel Dashboard
# Go to deployments → Select previous deployment → Promote to production
```

---

## Benefits of This Workflow

✅ **Automatic** - No manual deployment needed  
✅ **Fast** - Deploys in 30-60 seconds  
✅ **Safe** - Preview deployments for testing  
✅ **Tracked** - Full deployment history  
✅ **Collaborative** - Team members can deploy by pushing  
✅ **Rollback** - Easy to revert to previous versions  

---

## Troubleshooting

### Deployment Not Triggering?
1. Check GitHub webhook in Vercel settings
2. Verify you pushed to the correct branch
3. Check Vercel dashboard for errors

### Build Failing?
1. Check deployment logs in Vercel
2. Verify build works locally: `cd frontend && npm run build`
3. Check for missing environment variables

### Changes Not Showing?
1. Wait 30-60 seconds for deployment
2. Hard refresh browser (Cmd+Shift+R)
3. Check if deployment succeeded in Vercel dashboard

---

## What You DON'T Need

❌ GitHub Pages (not needed with Vercel)  
❌ Manual `vercel` commands after initial setup  
❌ Build scripts on your computer  
❌ FTP/SSH to servers  

Everything happens automatically in the cloud! 🎉

---

## Next Steps

- Add environment variables in Vercel dashboard
- Set up custom domain
- Configure preview deployments for specific branches
- Add deployment notifications to Slack/Discord

Happy deploying! 🚀

