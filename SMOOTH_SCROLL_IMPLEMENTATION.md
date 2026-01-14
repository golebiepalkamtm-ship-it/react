# Ultra-Smooth Parallax Scrolling Implementation

## 🎯 Overview

This implementation transforms the website into a high-end, smooth-scrolling experience using **GSAP**, **ScrollTrigger**, and **Lenis**. The result is a professional, fluid motion system optimized for 60fps+ on both mobile and desktop.

---

## 🛠️ Technologies Used

- **Lenis** - Ultra-smooth inertia scrolling library
- **GSAP** - Professional animation library
- **ScrollTrigger** - GSAP plugin for scroll-based animations
- **React** - Component framework

---

## 📦 Installation

```bash
npm install gsap lenis
```

---

## 🏗️ Architecture

### 1. **Smooth Scroll System** (`src/lib/smoothScroll.ts`)

Manages Lenis initialization and GSAP ticker integration.

**Key Parameters:**
- `lerp` (0-1): Smoothness factor. Lower = smoother but slower
  - `0.05` = Very smooth, slow
  - `0.1` = Smooth, balanced (recommended)
  - `0.2` = Snappy, responsive
  
- `duration` (seconds): Time for scroll to reach target
  - `1.0` = Quick
  - `1.2` = Fluid (recommended)
  - `2.0` = Very smooth

**Example:**
```typescript
import { initSmoothScroll } from '@/lib/smoothScroll';

// Initialize with custom settings
initSmoothScroll(0.1, 1.2);
```

---

### 2. **GSAP Animations** (`src/lib/gsapAnimations.ts`)

Professional animation system with ScrollTrigger.

#### **Staggered Heading Reveals**
Animates H1 and H2 headings word-by-word for a typewriter effect.

```typescript
initHeadingReveals();
```

**How it works:**
1. Splits text into individual words
2. Wraps each word in a span with overflow hidden
3. Animates from `yPercent: 100` to `yPercent: 0`
4. Staggers animation with 0.05s delay between words

#### **Hero Parallax Scale**
Scales hero image from 1.2x to 1.0x as user scrolls.

```typescript
initHeroParallax('.hero-image', 1.2);
```

**Parameters:**
- `selector`: CSS selector for hero image
- `scale`: Initial scale (1.2 = 120% size)

**How it works:**
- Uses `scrub: 1` for smooth 1-second delay
- Linear easing (`ease: 'none'`) for natural parallax
- Triggers from `top top` to `bottom top`

#### **Depth Parallax**
Creates depth by moving elements at different speeds.

```html
<!-- Background (slow) -->
<div data-speed="0.5">Background Layer</div>

<!-- Midground (normal) -->
<div data-speed="1.0">Content Layer</div>

<!-- Foreground (fast) -->
<div data-speed="1.5">Foreground Layer</div>
```

**Speed Guidelines:**
- `0.3-0.5` = Background (slow, appears far away)
- `1.0` = Normal speed (no parallax)
- `1.2-1.5` = Foreground (fast, appears close)

**How it works:**
- Calculates movement based on element position and speed
- Uses `scrub: 0.5` for very smooth parallax
- `invalidateOnRefresh: true` recalculates on resize

#### **Section Reveals**
Fades in and slides up sections as they enter viewport.

```html
<section data-reveal>
  <!-- Content -->
</section>
```

**How it works:**
- Animates from `opacity: 0, y: 60` to `opacity: 1, y: 0`
- Triggers at `top 80%` (when 80% down viewport)
- Uses `power3.out` easing for smooth deceleration

#### **Card Stagger**
Animates cards in sequence with stagger delay.

```html
<div data-stagger-container>
  <div data-stagger-item>Card 1</div>
  <div data-stagger-item>Card 2</div>
  <div data-stagger-item>Card 3</div>
</div>
```

**How it works:**
- Animates from `opacity: 0, y: 40, scale: 0.95`
- Staggers with 0.1s delay between cards
- Triggers at `top 75%`

---

### 3. **React Hook** (`src/hooks/useSmoothScroll.ts`)

Manages lifecycle of smooth scroll and animations in React.

```typescript
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

export const HomePage = () => {
  useSmoothScroll({
    lerp: 0.1,              // Smoothness
    duration: 1.2,          // Duration
    enableAnimations: true, // Enable GSAP animations
  });

  return <div>...</div>;
};
```

**Features:**
- Initializes Lenis on mount
- Initializes GSAP animations after 100ms delay
- Refreshes ScrollTrigger on window resize
- Cleans up on unmount

---

## 🎨 Performance Optimization

### CSS Optimizations (`src/styles/smooth-scroll.css`)

**GPU Acceleration:**
```css
[data-speed] {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

**Benefits:**
- Forces GPU rendering for 60fps+
- Prevents flickering and jank
- Optimizes for mobile devices

**Automatic Cleanup:**
```css
.animation-complete {
  will-change: auto !important;
}
```

Removes `will-change` after animation completes to free GPU memory.

**Mobile Optimization:**
```css
@media (max-width: 768px) {
  [data-speed] {
    transform: none !important;
  }
}
```

Disables parallax on mobile for better performance.

---

## 🎯 Usage Examples

### Example 1: Hero Section with Parallax

```tsx
<section className="hero">
  {/* Background - slow */}
  <div className="bg" data-speed="0.5">
    <img src="bg.jpg" alt="Background" />
  </div>
  
  {/* Content - fast */}
  <div className="content" data-speed="1.2">
    <h1>Welcome</h1>
    <p>Discover amazing content</p>
  </div>
</section>
```

### Example 2: Feature Section with Stagger

```tsx
<section data-reveal>
  <h2>Our Features</h2>
  
  <div data-stagger-container>
    <div data-stagger-item>Feature 1</div>
    <div data-stagger-item>Feature 2</div>
    <div data-stagger-item>Feature 3</div>
  </div>
</section>
```

### Example 3: Custom Parallax Image

```tsx
<div className="parallax-wrapper">
  <img 
    src="hero.jpg" 
    alt="Hero" 
    className="hero-image"
  />
</div>
```

Then initialize:
```typescript
initHeroParallax('.hero-image', 1.3);
```

---

## 🔧 Customization Guide

### Adjust Smoothness

**More Smooth (slower response):**
```typescript
useSmoothScroll({
  lerp: 0.05,    // Very smooth
  duration: 2.0, // Very slow
});
```

**More Snappy (faster response):**
```typescript
useSmoothScroll({
  lerp: 0.2,     // Snappy
  duration: 1.0, // Quick
});
```

### Adjust Parallax Speed

**Subtle parallax:**
```html
<div data-speed="0.9">Subtle movement</div>
```

**Dramatic parallax:**
```html
<div data-speed="2.0">Dramatic movement</div>
```

### Adjust Stagger Timing

In `gsapAnimations.ts`:
```typescript
stagger: 0.05, // Fast stagger
stagger: 0.15, // Slow stagger
```

### Adjust Scrub Smoothness

```typescript
scrub: 0.3,  // Very responsive
scrub: 1,    // Balanced (recommended)
scrub: 2,    // Very smooth
scrub: true, // Instant (no delay)
```

---

## 🐛 Debugging

### Enable ScrollTrigger Markers

In `gsapAnimations.ts`, uncomment:
```typescript
scrollTrigger: {
  markers: true, // Shows visual markers
}
```

### Check Lenis Status

```typescript
import { getLenis } from '@/lib/smoothScroll';

const lenis = getLenis();
console.log('Lenis active:', lenis !== null);
```

### Refresh ScrollTrigger

After DOM changes:
```typescript
import { refreshScrollTrigger } from '@/lib/gsapAnimations';

refreshScrollTrigger();
```

---

## 📊 Performance Metrics

**Target Performance:**
- 60fps+ on desktop
- 60fps+ on mobile
- < 100ms input latency
- Smooth 120fps on high-refresh displays

**Optimization Techniques:**
1. GPU acceleration via `will-change` and `translateZ(0)`
2. Single RAF loop (GSAP ticker + Lenis)
3. Disabled parallax on mobile
4. Automatic cleanup of `will-change`
5. `invalidateOnRefresh` for accurate calculations

---

## 🎓 Educational Notes

### What is Lerp?

**Lerp** (Linear Interpolation) smoothly transitions between two values:

```
current = current + (target - current) * lerp
```

- Lower lerp = smoother but slower
- Higher lerp = snappier but less smooth

### What is Scrub?

**Scrub** ties animation progress directly to scroll position:

- `scrub: true` = Instant (no delay)
- `scrub: 1` = 1-second smooth delay
- `scrub: 2` = 2-second very smooth delay

### What is will-change?

**will-change** tells the browser to optimize an element for animation:

```css
will-change: transform;
```

**Benefits:**
- Creates a new GPU layer
- Prevents repaints
- Enables hardware acceleration

**Warning:** Don't overuse! Only apply to animating elements.

---

## 🚀 Next Steps

1. **Test on mobile devices** - Ensure 60fps performance
2. **Adjust lerp/duration** - Find the perfect feel for your brand
3. **Add more parallax layers** - Create depth with data-speed
4. **Customize animations** - Modify timing and easing in gsapAnimations.ts
5. **Monitor performance** - Use Chrome DevTools Performance tab

---

## 📚 Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Lenis GitHub](https://github.com/studio-freight/lenis)
- [will-change MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)

---

**Created by:** Senior Creative Developer  
**Date:** 2026-01-11  
**Version:** 1.0.0
