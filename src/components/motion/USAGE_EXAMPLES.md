# Motion System Usage Examples

This document provides practical examples of using the global animation system.

## Quick Start

```tsx
import { Reveal, StaggeredList, fadeInUp, buttonMicro } from "@/components/motion";
import { motion } from "framer-motion";
```

## Basic Reveal on Scroll

```tsx
<Reveal>
  <h1>This fades in when scrolled into view</h1>
</Reveal>

<Reveal variants={fadeInLeft} delay={0.2}>
  <p>Custom animation with delay</p>
</Reveal>
```

## Staggered Lists

```tsx
<StaggeredList staggerDelay={0.1}>
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</StaggeredList>

// Or with StaggeredItem for more control
<StaggeredList>
  <StaggeredItem>
    <Card>Item 1</Card>
  </StaggeredItem>
  <StaggeredItem>
    <Card>Item 2</Card>
  </StaggeredItem>
</StaggeredList>
```

## Page Transitions

```tsx
import { PageTransition } from "@/components/motion";

// Wrap your routes
<PageTransition>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
  </Routes>
</PageTransition>
```

## Micro-Interactions

```tsx
import { buttonMicro, cardMicro } from "@/components/motion";

// Button with hover/tap effects
<motion.button
  variants={buttonMicro}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
>
  Click Me
</motion.button>

// Card with hover lift
<motion.div
  variants={cardMicro}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
  className="card"
>
  Card Content
</motion.div>
```

## LayoutGroup for Synchronized Transitions

```tsx
import { LayoutGroup } from "framer-motion";
import { Reveal, StaggeredList } from "@/components/motion";

<LayoutGroup>
  <Reveal>
    <StaggeredList>
      {/* Children will be synchronized */}
    </StaggeredList>
  </Reveal>
</LayoutGroup>
```

## Available Variants

- `fadeInUp` - Fade in with 20px upward motion
- `fadeInDown` - Fade in with downward motion
- `fadeInLeft` - Fade in from left
- `fadeInRight` - Fade in from right
- `fadeIn` - Simple fade
- `scaleIn` - Scale in animation
- `scaleInBounce` - Scale in with bounce
- `reveal` - Clip-path reveal effect
- `buttonMicro` - Button hover/tap interactions
- `cardMicro` - Card hover/tap interactions
- `iconMicro` - Icon hover/tap interactions

## Spring Configurations

- `springConfig.default` - mass: 1, stiffness: 100, damping: 20
- `springConfig.gentle` - Softer spring
- `springConfig.snappy` - Snappier spring
- `springConfig.bouncy` - Bouncy spring

## Accessibility

All animations automatically respect `prefers-reduced-motion`. No additional configuration needed!

