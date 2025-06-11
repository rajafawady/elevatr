# Elevatr Design System Documentation

## Overview

The Elevatr Design System is a comprehensive theming solution for the Elevatr career sprint tracker PWA. It implements a motivational, clean, and modern design philosophy using glassmorphism effects, carefully chosen color palettes, and utility-first CSS classes.

## Design Philosophy

- **Motivational**: Energizing colors and gradients that inspire action
- **Clean**: Minimal, focused interfaces that reduce cognitive load
- **Calm**: Soothing color palette that promotes focus and well-being
- **Modern**: Contemporary design patterns with glassmorphism and subtle animations

## Color Palette

### Light Mode
- **Primary**: `#3B82F6` (Sky Blue) - Primary actions, buttons, active states
- **Secondary**: `#64748B` (Cool Gray) - Secondary text, subtle elements
- **Accent**: `#14B8A6` (Teal) - Highlights, special features, call-to-actions
- **Success**: `#10B981` (Emerald) - Completed tasks, positive feedback
- **Journal**: `#D8B4FE` (Lavender) - Journal entries, reflection content
- **Badge**: `#F59E0B` (Amber) - Achievements, motivational elements
- **Background**: `#FFFFFF` (White) - Main background
- **Text Primary**: `#334155` (Slate Gray) - Primary text content
- **Text Secondary**: `#64748B` (Cool Gray) - Secondary text content

### Dark Mode
- **Background**: `#0F172A` - Main dark background
- **Surface**: `#1E293B` - Card and panel backgrounds
- **Text**: `#F8FAFC` - Primary text in dark mode
- **Accents**: Same as light mode for continuity

## Core Components

### Cards (`ElevatrCard`)

```tsx
import { ElevatrCard, ElevatrCardHeader, ElevatrCardContent } from '@/components/ui/ElevatrTheme';

<ElevatrCard variant="glass" hover>
  <ElevatrCardHeader>
    <ElevatrCardTitle>Card Title</ElevatrCardTitle>
    <ElevatrCardDescription>Card description</ElevatrCardDescription>
  </ElevatrCardHeader>
  <ElevatrCardContent>
    Content goes here
  </ElevatrCardContent>
</ElevatrCard>
```

**Variants:**
- `default` - Standard card with background
- `glass` - Glassmorphism effect with blur
- `glass-strong` - Stronger glass effect
- `interactive` - Hover effects for clickable cards
- `stat` - Optimized for statistics display
- `journal` - Special styling for journal entries
- `progress` - Progress tracking cards

**Themes:**
- `primary` - Blue theme
- `success` - Green theme  
- `accent` - Teal theme
- `journal` - Lavender theme
- `motivation` - Multi-color gradient theme

### Buttons (`ElevatrButton`)

```tsx
import { ElevatrButton } from '@/components/ui/ElevatrTheme';

<ElevatrButton variant="primary" size="md" onClick={handleClick}>
  Click Me
</ElevatrButton>
```

**Variants:**
- `primary` - Main action button (blue gradient)
- `secondary` - Secondary actions (outlined)
- `accent` - Accent actions (teal gradient)
- `success` - Success actions (green gradient)
- `motivation` - Special motivation gradient

**Sizes:**
- `sm` - Small button
- `md` - Medium button (default)
- `lg` - Large button

### Progress Indicators (`ElevatrProgress`)

```tsx
import { ElevatrProgress } from '@/components/ui/ElevatrTheme';

<ElevatrProgress 
  value={75} 
  max={100} 
  variant="primary" 
  showPercentage 
  animated 
/>
```

### Status Indicators (`ElevatrStatusIndicator`)

```tsx
import { ElevatrStatusIndicator } from '@/components/ui/ElevatrTheme';

<ElevatrStatusIndicator status="completed">
  <CheckIcon className="w-4 h-4" />
</ElevatrStatusIndicator>
```

**Status Types:**
- `active` - Currently in progress (blue)
- `completed` - Finished (green)
- `error` - Error state (red)  
- `pending` - Waiting/queued (gray)

### Sprint Cards (`ElevatrSprintCard`)

```tsx
import { ElevatrSprintCard } from '@/components/ui/ElevatrTheme';

<ElevatrSprintCard
  title="Q2 Development Sprint"
  description="Focus on React and TypeScript skills"
  status="active"
  progress={68}
  startDate="May 1"
  endDate="Jun 30"
  tasksCount={15}
  completedTasks={10}
  onClick={handleSprintClick}
/>
```

### Task Cards (`ElevatrTaskCard`)

```tsx
import { ElevatrTaskCard } from '@/components/ui/ElevatrTheme';

<ElevatrTaskCard
  title="Complete React certification"
  description="Finish advanced course and pass exam"
  priority="high"
  status="in-progress"
  dueDate="Jun 15"
  timeEstimate="8 hours"
  tags={["Learning", "React"]}
  onClick={handleTaskClick}
/>
```

### Journal Cards (`ElevatrJournalCard`)

```tsx
import { ElevatrJournalCard } from '@/components/ui/ElevatrTheme';

<ElevatrJournalCard
  date="June 11, 2025"
  mood={4}
  reflection="Great progress today..."
  achievements={["Completed certification", "Helped colleague"]}
  challenges={["Time management"]}
  goals={["Finish by Friday"]}
  gratitude={["Supportive team"]}
  onClick={handleJournalClick}
/>
```

## Glassmorphism Effects

The Elevatr theme extensively uses glassmorphism for modern, elegant interfaces:

### CSS Classes
- `.glass-card` - Standard glass effect
- `.glass-card-strong` - More pronounced glass effect
- `.glass-panel` - Subtle glass for panels

### Properties
- Background: Semi-transparent with blur
- Border: Subtle light border
- Backdrop Filter: Blur effect (16px standard, 24px strong)
- Shadow: Soft shadows for depth

## Animations

### Available Animations
- `elevatr-animate-fade-in-up` - Fade in from bottom
- `elevatr-animate-fade-in-scale` - Fade in with scale
- `elevatr-animate-slide-in-right` - Slide in from right
- `elevatr-animate-slide-in-left` - Slide in from left
- `elevatr-animate-pulse-glow` - Pulsing glow effect
- `elevatr-animate-motivation-pulse` - Special motivation pulse
- `elevatr-animate-float` - Gentle floating motion
- `elevatr-animate-bounce-subtle` - Subtle bounce
- `elevatr-animate-gradient-shift` - Shifting gradient effect

### Hover Effects
- `elevatr-hover-lift` - Lifts element on hover
- `elevatr-hover-glow` - Adds glow on hover
- `elevatr-hover-scale` - Scales element on hover

## Responsive Design

### Breakpoints
- Mobile: `max-width: 768px`
- Small Mobile: `max-width: 480px`
- Tablet: `min-width: 769px`
- Desktop: `min-width: 1024px`

### Mobile Optimizations
- Reduced glassmorphism intensity for performance
- Smaller shadows and effects
- Adjusted padding and sizing
- Simplified animations for better performance

### Grid Utilities
- `elevatr-grid` - Base grid container
- `elevatr-grid-responsive` - Responsive 1/2/3 column layout
- `elevatr-grid-auto-fit` - Auto-fitting columns (min 280px)
- `elevatr-grid-auto-fill` - Auto-filling columns (min 320px)

## Accessibility

### Features
- High contrast mode support
- Reduced motion support for users with vestibular disorders
- Proper focus management with visible focus rings
- ARIA labels and semantic HTML
- Keyboard navigation support

### Focus Management
- `elevatr-focus-ring` - Standard focus ring
- `elevatr-focus-ring-accent` - Accent color focus ring

## Performance Considerations

### Mobile Optimizations
- Reduced backdrop-filter intensity on mobile devices
- Simplified animations for better performance
- Smaller file sizes for mobile-specific styles

### Loading States
- `elevatr-loading` - Loading shimmer effect
- `elevatr-skeleton` - Skeleton loading placeholder
- `elevatr-skeleton-text` - Text skeleton lines

## Usage Guidelines

### Do's
- Use glassmorphism for cards and elevated surfaces
- Apply consistent spacing using the grid system
- Use motivation gradients for achievements and positive feedback
- Implement proper loading states for async operations
- Test on mobile devices for performance

### Don'ts
- Don't overuse animations (respect reduced motion preferences)
- Don't use too many different variants in one view
- Don't ignore accessibility requirements
- Don't apply glassmorphism to every element (use sparingly)

## Theme Utilities

### Import Everything
```tsx
import * from '@/components/ui/ElevatrTheme';
```

### Use Theme Constants
```tsx
import { elevatrTheme, elevatrClasses } from '@/components/ui/ElevatrTheme';

// Access color values
const primaryColor = elevatrTheme.colors.primary;

// Use predefined classes
const cardClass = elevatrClasses.cardGlass;
```

### Get Variant Classes
```tsx
import { getElevatrVariantClasses } from '@/components/ui/ElevatrTheme';

const buttonClass = getElevatrVariantClasses('button', 'primary');
```

## Examples

See `ElevatrThemeShowcase.tsx` for comprehensive examples of all components and their usage patterns.

## Browser Support

- Modern browsers with backdrop-filter support
- Graceful degradation for older browsers
- Optimized for mobile Safari and Chrome
- High DPI/Retina display optimizations

## Customization

The theme system is built with CSS custom properties, making it easy to customize:

```css
:root {
  --primary: 217 91% 60%; /* Custom primary color */
  --glass-bg: rgba(255, 255, 255, 0.2); /* Custom glass effect */
}
```

## Future Enhancements

- Dark mode improvements
- Additional component variants
- More animation options
- Enhanced accessibility features
- Performance optimizations
