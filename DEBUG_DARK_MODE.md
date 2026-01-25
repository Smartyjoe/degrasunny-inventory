# Dark Mode Debug Guide

## Console Logs Added

I've added console.log statements to help debug the dark mode toggle:

### What to Check:

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Refresh the page**
4. **Look for these messages:**

```
Theme changing to: light (or dark)
HTML classes: light (or dark)
Header rendered, theme: light (or dark)
```

5. **Click the Moon/Sun icon**
6. **You should see:**

```
Toggle theme clicked, current: light
Switching to: dark
Theme changing to: dark
HTML classes: dark
Header rendered, theme: dark
```

## Step-by-Step Testing

### Step 1: Check Initial Load
```javascript
// Run in console
console.log('Theme:', localStorage.getItem('theme'))
console.log('HTML class:', document.documentElement.className)
```

**Expected**: Should show 'light' or 'dark'

### Step 2: Manual Toggle Test
```javascript
// Run in console
document.documentElement.classList.add('dark')
```

**Expected**: Page should immediately switch to dark mode

### Step 3: Check if ThemeContext is Working
```javascript
// Run in console after clicking toggle
console.log('After toggle, theme:', localStorage.getItem('theme'))
console.log('After toggle, HTML:', document.documentElement.className)
```

**Expected**: Values should change

## Common Issues & Solutions

### Issue 1: Console shows "useTheme must be used within ThemeProvider"
**Cause**: ThemeProvider not wrapping the component
**Status**: ✅ Fixed (verified in main.tsx)

### Issue 2: No console logs appear
**Cause**: Old cached version of the app
**Solution**: 
1. Hard refresh: Ctrl+Shift+R
2. Clear cache: DevTools → Network → Disable cache (checkbox)
3. Close and reopen browser

### Issue 3: Toggle fires but theme doesn't change
**Cause**: Multiple possible reasons

**Check 1**: Are console logs appearing?
- If YES: React state is updating
- If NO: Event handler not firing

**Check 2**: Is HTML class changing?
```javascript
// Watch for changes
setInterval(() => {
  console.log('HTML class:', document.documentElement.className)
}, 1000)
```

**Check 3**: Are Tailwind dark: classes working?
```javascript
// Manual test
document.documentElement.classList.add('dark')
// Should see dark mode immediately
```

### Issue 4: Theme doesn't persist after reload
**Cause**: localStorage not being read
**Check**:
```javascript
console.log('Stored theme:', localStorage.getItem('theme'))
```

## Force Theme Change

### To Force Dark Mode:
```javascript
localStorage.setItem('theme', 'dark')
document.documentElement.classList.remove('light')
document.documentElement.classList.add('dark')
location.reload()
```

### To Force Light Mode:
```javascript
localStorage.setItem('theme', 'light')
document.documentElement.classList.remove('dark')
document.documentElement.classList.add('light')
location.reload()
```

## Verify Tailwind Config

```javascript
// Check if Tailwind is detecting dark mode
const styles = getComputedStyle(document.body)
console.log('Body bg in light:', styles.backgroundColor)

document.documentElement.classList.add('dark')
const darkStyles = getComputedStyle(document.body)
console.log('Body bg in dark:', darkStyles.backgroundColor)
```

**Expected**: Colors should be different

## If Everything Above Works But UI Doesn't Toggle:

This means:
1. ✅ React state is updating (console logs appear)
2. ✅ HTML class is changing (can see in Elements tab)
3. ✅ Tailwind dark: classes exist (manual test works)
4. ❌ Button click isn't triggering toggle

**Solution**: Check for event handler conflicts

```typescript
// In Header.tsx, change:
onClick={toggleTheme}

// To:
onClick={() => {
  console.log('Button clicked!')
  toggleTheme()
}}
```

## Current Implementation Status

✅ ThemeProvider wraps App
✅ useTheme hook in Header
✅ toggleTheme function implemented
✅ useEffect updates HTML class
✅ localStorage saves theme
✅ Tailwind config has darkMode: 'class'
✅ All components have dark: classes
✅ Console logs added for debugging

## What You Should See

### In Console (after clicking toggle):
```
Toggle theme clicked, current: light
Switching to: dark
Theme changing to: dark
HTML classes: dark
Header rendered, theme: dark
```

### In Elements Tab:
```html
<html lang="en" class="dark">
```

### On Screen:
- Background should change from white/gray-50 to gray-950/gray-900
- Text should change from dark to light
- Cards should change from white to gray-800
- All UI elements should adapt

## Next Steps

1. **Hard refresh**: Ctrl+Shift+R
2. **Open console**: F12
3. **Click toggle**: Watch console logs
4. **Check Elements**: Verify HTML class changes
5. **Report back**: Share console output if it still doesn't work

---

**If you see all console logs but theme still doesn't change visually:**
- The issue is with CSS/Tailwind, not React
- Check if `tailwind.config.js` has `darkMode: 'class'` (it does ✅)
- Check if styles are being applied in Elements → Computed tab
