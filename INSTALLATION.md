# Installation Instructions

## System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (comes with Node.js)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for node_modules
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Step-by-Step Installation

### Step 1: Verify Node.js Installation

Open your terminal and check Node.js version:

```bash
node --version
```

Expected output: `v18.0.0` or higher

If not installed, download from: https://nodejs.org/

### Step 2: Navigate to Project Directory

```bash
cd trader-inventory-dashboard
```

### Step 3: Install Dependencies

This will install all required packages (~500MB):

```bash
npm install
```

**Expected time**: 2-5 minutes depending on internet speed

You should see output like:
```
added 250 packages, and audited 251 packages in 2m
```

### Step 4: Verify Installation

Check if dependencies were installed:

```bash
npm list --depth=0
```

You should see key packages:
- react@^18.2.0
- @tanstack/react-query@^5.17.9
- zustand@^4.4.7
- tailwindcss@^3.4.0
- And many more...

### Step 5: Start Development Server

```bash
npm run dev
```

**Expected output**:
```
  VITE v5.0.8  ready in 423 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 6: Open in Browser

Navigate to: http://localhost:3000

You should see the login page.

### Step 7: Login with Demo Credentials

- **Email**: `trader@example.com`
- **Password**: `password`

Click "Sign In" and you'll be redirected to the dashboard.

## ✅ Installation Complete!

You should now see:
- Dashboard with stats
- Navigation sidebar
- Today's sales summary
- Low stock alerts
- Recent sales

## What's Installed?

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.1",
  "@tanstack/react-query": "^5.17.9",
  "zustand": "^4.4.7",
  "react-hook-form": "^7.49.3",
  "zod": "^3.22.4",
  "axios": "^1.6.5",
  "recharts": "^2.10.3",
  "lucide-react": "^0.303.0",
  "date-fns": "^3.0.6",
  "react-hot-toast": "^2.4.1"
}
```

### Dev Dependencies
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "typescript": "^5.2.2",
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.32",
  "vite": "^5.0.8"
}
```

## Troubleshooting

### Issue: `npm install` fails

**Solution 1**: Clear npm cache
```bash
npm cache clean --force
npm install
```

**Solution 2**: Delete package-lock.json
```bash
rm package-lock.json
npm install
```

**Solution 3**: Use different registry
```bash
npm install --registry=https://registry.npmjs.org/
```

### Issue: Port 3000 already in use

**Solution**: Use different port
```bash
npm run dev -- --port 3500
```

Then open: http://localhost:3500

### Issue: TypeScript errors

**Solution**: Ensure TypeScript is installed
```bash
npm install --save-dev typescript
```

### Issue: Module not found errors

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Vite not found

**Solution**: Install Vite globally (optional)
```bash
npm install -g vite
```

Or use npx:
```bash
npx vite
```

### Issue: Browser shows blank page

**Solution 1**: Check console for errors (F12)
**Solution 2**: Hard refresh (Ctrl+Shift+R)
**Solution 3**: Clear browser cache

### Issue: Styles not loading

**Solution**: Ensure Tailwind is configured
1. Check `tailwind.config.js` exists
2. Check `postcss.config.js` exists
3. Restart dev server

## Verify Installation

Run this checklist:

- [ ] `npm install` completed without errors
- [ ] `npm run dev` starts server
- [ ] Browser opens http://localhost:3000
- [ ] Login page displays correctly
- [ ] Can login with demo credentials
- [ ] Dashboard shows data
- [ ] Navigation works
- [ ] Can view Products page
- [ ] Can view Sales page
- [ ] Can view Reports page

## Next Steps

After successful installation:

1. **Explore the App**
   - Navigate through all pages
   - Try creating a product
   - Record a test sale
   - View reports

2. **Read Documentation**
   - [README.md](README.md) - Full documentation
   - [SETUP_GUIDE.md](SETUP_GUIDE.md) - Quick start
   - [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Feature guide

3. **Customize**
   - Update `.env` for API URL
   - Change colors in `tailwind.config.js`
   - Modify currency in `src/utils/format.ts`

4. **Development**
   - Explore source code in `src/`
   - Modify components as needed
   - Connect to your backend API

## Build for Production

When ready to deploy:

```bash
npm run build
```

Output will be in `dist/` folder.

Preview production build:
```bash
npm run preview
```

## Additional Commands

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Clean install
rm -rf node_modules package-lock.json && npm install

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

## Development Tips

### Hot Reload
- Changes auto-reload in browser
- No need to refresh manually
- Fast feedback loop

### Error Messages
- Check terminal for build errors
- Check browser console for runtime errors
- Both sources provide helpful info

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

## Performance Notes

### First Install
- Takes 2-5 minutes
- Downloads ~250 packages
- Creates ~500MB node_modules

### Dev Server Start
- Takes 1-3 seconds
- Uses Vite for fast HMR
- Automatic port detection

### Browser Load
- First load: 2-3 seconds
- Subsequent loads: < 1 second
- Uses React Query caching

## Security Notes

### Demo Mode (Default)
- Uses mock data (no backend)
- Data stored in browser only
- Safe to experiment
- No real API calls

### Production Mode
- Connect to real backend
- Enable authentication
- Use environment variables
- Deploy with HTTPS

## Support

### Getting Help
1. Check this installation guide
2. Read [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. Review [README.md](README.md)
4. Check browser console (F12)
5. Check terminal output

### Common Resources
- Node.js docs: https://nodejs.org/docs
- React docs: https://react.dev
- Vite docs: https://vitejs.dev
- TailwindCSS docs: https://tailwindcss.com

## Success Indicators

✅ **You're ready to go if:**
- Dev server starts without errors
- Login page displays properly
- Can authenticate successfully
- Dashboard shows mock data
- All navigation links work
- Forms are interactive
- Charts render properly

## Final Checklist

Before starting development, verify:

- [x] Node.js installed (v18+)
- [x] npm install completed
- [x] Dev server running
- [x] App loads in browser
- [x] Can login successfully
- [x] All pages accessible
- [x] Mock data visible
- [x] No console errors

---

**Installation Complete! 🎉**

You're ready to start managing your inventory!

Run `npm run dev` and visit http://localhost:3000 to begin.
