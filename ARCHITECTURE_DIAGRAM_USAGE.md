# Interactive Architecture Diagram - Usage Guide

## Overview

The Interactive Architecture Diagram is a production-ready component that visually represents system architecture with interactive nodes and connections. Each component is clickable and reveals detailed information about technologies, design decisions, and trade-offs.

## Quick Start

### Option 1: Use the Pre-built Section Component

```tsx
import ArchitectureSection from '@/components/ArchitectureSection';

// In your page/component:
<ArchitectureSection />;
```

This uses the included mock data. To customize:

```tsx
<ArchitectureSection nodes={yourNodes} edges={yourEdges} />
```

### Option 2: Use the Diagram Component Directly

```tsx
import {
  ArchitectureDiagram,
  mockArchitectureData,
} from '@/components/ArchitectureDiagram';

<ArchitectureDiagram
  nodes={mockArchitectureData.nodes}
  edges={mockArchitectureData.edges}
/>;
```

## Data Structure

### ArchitectureNode

```typescript
interface ArchitectureNode {
  id: string; // Unique identifier
  label: string; // Display name (e.g., "React Frontend")
  layer: ArchitectureLayer; // 'client' | 'api' | 'database' | 'cache' | 'auth' | 'cloud'
  techStack: string[]; // Technologies used
  responsibilities: string[]; // What this component does
  decisions: string[]; // Key design decisions
  tradeoffs?: string[]; // Trade-offs and alternatives considered
  scale10x?: {
    // Optional: Overrides for "At 10× Scale" view
    label?: string;
    techStack?: string[];
    responsibilities?: string[];
    decisions?: string[];
    tradeoffs?: string[];
  };
}
```

### ArchitectureEdge

```typescript
interface ArchitectureEdge {
  from: string; // ID of source node
  to: string; // ID of target node
  protocol: Protocol; // 'HTTP' | 'WebSocket' | 'gRPC' | 'GraphQL' | 'TCP' | 'UDP'
  reason: string; // Why these components are connected
  scale10x?: {
    // Optional: Overrides for "At 10× Scale" view
    protocol?: Protocol;
    reason?: string;
  };
}
```

## Example: Custom Architecture

```tsx
import {
  ArchitectureDiagram,
  type ArchitectureNode,
  type ArchitectureEdge,
} from '@/components/ArchitectureDiagram';

const myNodes: ArchitectureNode[] = [
  {
    id: 'frontend',
    label: 'Vue.js Frontend',
    layer: 'client',
    techStack: ['Vue 3', 'TypeScript', 'Vite'],
    responsibilities: [
      'User interface rendering',
      'Client-side state management',
    ],
    decisions: ['Vue 3 for reactivity and performance'],
    tradeoffs: ['Could use React but Vue fits our team better'],
  },
];

const myEdges: ArchitectureEdge[] = [
  {
    from: 'frontend',
    to: 'backend',
    protocol: 'HTTP',
    reason: 'REST API communication',
  },
];

<ArchitectureDiagram nodes={myNodes} edges={myEdges} />;
```

## Features

- **Click Interactions**: Click any node to view detailed information in a side panel
- **Hover Highlighting**: Hover over nodes or edges to see connections
- **Scale Toggle**: Switch between "Current Architecture" and "At 10× Scale" views
- **Layered Layout**: Components organized by architectural layers
- **Protocol Visualization**: Different colors for different communication protocols
- **Responsive Design**: Works on mobile and desktop
- **Smooth Animations**: Framer Motion for polished transitions

## Integration into Portfolio

To add to your portfolio, update `src/pages/Index.tsx`:

```tsx
import ArchitectureSection from '@/components/ArchitectureSection';

// Add in the main section:
<ArchitectureSection />;
```

## Customization

### Layer Colors

Edit `LAYER_CONFIG` in `ArchitectureDiagram.tsx` to change layer colors and positions.

### Protocol Colors

Edit `PROTOCOL_COLORS` to customize edge colors for different protocols.

### Layout

The component uses a horizontal layout algorithm. To adjust:

- Modify `calculateNodePositions()` function
- Adjust `graphWidth` and `graphHeight` constants
- Change `yPosition` values in `LAYER_CONFIG`

### Animations

All animations use Framer Motion. Customize in the `motion.*` components:

- `initial`, `animate`, `exit` props
- `transition` durations and easing

## Scale 10× Feature

The component supports showing how architecture would change at 10× scale:

1. Each node can have a `scale10x` property with overrides
2. Each edge can have a `scale10x` property with protocol/reason changes
3. Users toggle between views using the buttons at the top
4. The side panel shows a badge indicating which view is active

This helps demonstrate:

- Scalability thinking
- Understanding of system evolution
- Trade-off analysis at different scales

## Performance Notes

- Layout calculation is memoized
- Only visible nodes/edges are rendered
- Uses React.memo patterns where appropriate
- SVG rendering is optimized for smooth interactions

## Browser Support

- Modern browsers with SVG support
- CSS Grid and Flexbox support required
- Framer Motion requires modern JavaScript

## Best Practices

1. **Keep it Simple**: Focus on the most important components and connections
2. **Tell a Story**: Use the diagram to explain architectural decisions
3. **Be Honest**: Include trade-offs and alternatives, not just benefits
4. **Update Regularly**: Keep the diagram current with your actual architecture
5. **Scale Thinking**: Use the 10× scale feature to show growth mindset
