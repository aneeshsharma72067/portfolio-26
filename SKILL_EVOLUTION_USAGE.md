# Skill Evolution Graph - Usage Guide

## Overview

The Skill Evolution Graph is an interactive visualization component that displays your skills as nodes in a graph, with connections showing how skills relate to each other. A timeline slider controls which skills and connections are visible based on the selected year.

## Quick Start

### Option 1: Use the Pre-built Section Component

```tsx
import SkillEvolutionSection from '@/components/SkillEvolutionSection';

// In your page/component:
<SkillEvolutionSection />;
```

This uses the included mock data. To customize:

```tsx
<SkillEvolutionSection
  nodes={yourCustomNodes}
  edges={yourCustomEdges}
  minYear={2020}
  maxYear={2025}
/>
```

### Option 2: Use the Graph Component Directly

```tsx
import {
  SkillEvolutionGraph,
  mockSkillData,
} from '@/components/SkillEvolutionGraph';

<SkillEvolutionGraph
  nodes={mockSkillData.nodes}
  edges={mockSkillData.edges}
  minYear={2021}
  maxYear={2025}
/>;
```

## Data Structure

### SkillNode

```typescript
interface SkillNode {
  id: string; // Unique identifier
  label: string; // Display name (e.g., "React")
  category: SkillCategory; // 'frontend' | 'backend' | 'cloud' | 'system-design'
  startYear: number; // Year when skill was first learned
  proficiency: number; // 0-100, affects node size
  learnedContext?: string; // Optional: how/where it was learned
}
```

### SkillEdge

```typescript
interface SkillEdge {
  from: string; // ID of source skill node
  to: string; // ID of target skill node
  yearIntroduced: number; // Year when connection was established
  reason: string; // Explanation shown in tooltip
}
```

## Example: Custom Data

```tsx
import {
  SkillEvolutionGraph,
  type SkillNode,
  type SkillEdge,
} from '@/components/SkillEvolutionGraph';

const mySkills: SkillNode[] = [
  {
    id: 'react',
    label: 'React',
    category: 'frontend',
    startYear: 2021,
    proficiency: 95,
    learnedContext: 'Built my first SPA with React hooks',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    category: 'frontend',
    startYear: 2022,
    proficiency: 90,
    learnedContext: 'Adopted for type safety in production apps',
  },
];

const myConnections: SkillEdge[] = [
  {
    from: 'react',
    to: 'typescript',
    yearIntroduced: 2022,
    reason: 'TypeScript enhances React development with type safety',
  },
];

<SkillEvolutionGraph nodes={mySkills} edges={myConnections} />;
```

## Features

- **Timeline Slider**: Control which skills appear by year
- **Animated Transitions**: Smooth appearance and growth animations
- **Interactive Hover**: Hover nodes to see connections and details
- **Category Colors**: Visual distinction by skill category
- **Responsive Design**: Works on mobile and desktop
- **Tooltips**: Rich information on hover

## Integration into Portfolio

To add to your portfolio, update `src/pages/Index.tsx`:

```tsx
import SkillEvolutionSection from '@/components/SkillEvolutionSection';

// Add in the main section:
<SkillEvolutionSection />;
```

## Customization

### Colors

Edit `CATEGORY_COLORS` in `SkillEvolutionGraph.tsx` to change category colors.

### Layout

The component uses a force-directed layout algorithm. To adjust:

- Modify `calculateLayout()` function
- Adjust `graphWidth` and `graphHeight` constants
- Tweak force parameters (k, temperature, coolingRate)

### Animations

All animations use Framer Motion. Customize in the `motion.*` components:

- `initial`, `animate`, `exit` props
- `transition` durations and easing

## Performance Notes

- Layout calculation is memoized
- Only visible nodes/edges are rendered
- Uses React.memo patterns where appropriate
- SVG rendering is optimized for smooth animations

## Browser Support

- Modern browsers with SVG support
- CSS Grid and Flexbox support required
- Framer Motion requires modern JavaScript
