AGENTS.md

Project

ERA2 frontend.

Vite + React + TypeScript + Tailwind CSS v4.

Workflow

We work from Figma exports.

I will provide:

- XAML exports of components/screens
- a short explanation of what the component does
- where the component belongs in the application

Sometimes the XAML export will not contain the actual SVG vectors used by the design.

In that case:

1. Inspect the XAML.
2. Identify every missing icon or vector asset.
3. Tell me exactly which SVGs are required.
4. Wait for me to provide those SVGs.
5. Convert each SVG into its own reusable React component.

Do not replace missing custom icons with Lucide icons unless explicitly requested.

Styling

Use existing global styles from:

src/app/styles/styles.css

Do not create a new design system.

Prefer existing CSS variables and tokens whenever possible.

Fonts:

- Geist Variable
- Geist Mono Variable

The canonical theme is the existing ERA2 warm dark theme.

When implementing from XAML:

- Treat XAML as the source of truth for layout.
- Preserve spacing, sizing, typography, hierarchy, and visual structure.
- Use existing theme tokens whenever possible.
- Only hardcode values when no existing token is appropriate.
- Convert Canvas-style positioning into normal React layouts.
- Prefer flexbox and grid.
- Do not implement UI using <canvas>.

SVG Rules

Every custom SVG should become a dedicated component.

Example:

src/shared/ui/era/icons/QueueProgressIcon.tsx

Do not inline large SVG blobs directly into feature components.

Create reusable icon components and import them where needed.

Architecture

Follow the existing project structure.

Do not introduce:

- Redux
- MobX
- Zustand
- React Query
- fake backend services

unless explicitly requested.

Queue Feature

Queue ownership:

src/entities/generation

Queue state is shared through Context.

Widget and page must consume the same source of truth.

Expectations

When implementing a component:

1. Determine where it belongs.
2. Determine whether new files are required.
3. Reuse existing UI primitives when possible.
4. Create SVG components when necessary.
5. Explain any architectural decisions briefly before implementation.
