# ForgeCloud UI Design System & Component Guidelines

## 1. Overview & Philosophy
ForgeCloud is a self-service cloud-native internal developer platform.
The design system establishes a high-craft, cohesive developer experience inspired by:
- **Linear**: 1px hairline borders, flat subtle surfaces, high-contrast typography discipline, quiet micro-interactions, no heavy skeuomorphism.
- **Vercel**: Developer-first dark visual language, clear deployment status indicators, generous whitespace, structured card layouts.
- **Stripe**: Dense yet highly legible data tables, explicit search/filter placements, breadcrumb patterns, structured detail headers.

---

## 2. Design Tokens

### 2.1 Color Tokens
The color palette supports both **Dark Mode (Default)** and **Light Mode** through semantic CSS Custom Properties.

#### Neutral Palette
| Token | Dark Mode (`[data-theme="dark"]`, `:root`) | Light Mode (`[data-theme="light"]`) | Usage |
| :--- | :--- | :--- | :--- |
| `--fc-bg-page` | `#090d16` | `#f8fafc` | Canvas / viewport background |
| `--fc-bg-surface` | `#0f172a` | `#ffffff` | Cards, sidebar, tables, containers |
| `--fc-bg-elevated` | `#162036` | `#ffffff` | Modals, dropdowns, popovers |
| `--fc-bg-subtle` | `#1e293b` | `#f1f5f9` | Table headers, secondary buttons, tags |
| `--fc-bg-input` | `#0b111e` | `#ffffff` | Form input backgrounds |
| `--fc-border-subtle` | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.08)` | 1px hairline card/table dividers |
| `--fc-border-medium` | `rgba(255, 255, 255, 0.16)` | `rgba(0, 0, 0, 0.16)` | Form inputs, interactive borders |
| `--fc-border-strong` | `rgba(255, 255, 255, 0.3)` | `rgba(0, 0, 0, 0.28)` | Hover/active borders |
| `--fc-text-primary` | `#f8fafc` | `#0f172a` | High-contrast headings, main content |
| `--fc-text-secondary`| `#94a3b8` | `#475569` | Descriptions, secondary data, labels |
| `--fc-text-muted` | `#64748b` | `#64748b` | Timestamps, metadata, hints |
| `--fc-text-inverse` | `#090d16` | `#ffffff` | Inverted element text |

#### Primary Brand Accent
- Base: `--fc-primary: #00d2ff` (Vibrant cyan)
- Hover: `--fc-primary-hover: #38bdf8`
- Subtle Background: `--fc-primary-subtle: rgba(0, 210, 255, 0.12)`
- Border: `--fc-primary-border: rgba(0, 210, 255, 0.3)`
- Foreground Text: `--fc-primary-text: #090d16`

#### Semantic Status Colors (WCAG AA Compliant)
| Status | Token | Base Color | Background Token | Border Token |
| :--- | :--- | :--- | :--- | :--- |
| `RUNNING` / `HEALTHY` | `--fc-status-success` | `#10b981` (Green) | `rgba(16, 185, 129, 0.12)` | `rgba(16, 185, 129, 0.28)` |
| `DEPLOYING` / `BUILDING` | `--fc-status-warning` | `#f59e0b` (Amber) | `rgba(245, 158, 11, 0.12)` | `rgba(245, 158, 11, 0.28)` |
| `FAILED` / `ERROR` | `--fc-status-danger` | `#ef4444` (Red) | `rgba(239, 68, 68, 0.12)` | `rgba(239, 68, 68, 0.28)` |
| `ROLLED_BACK` | `--fc-status-orange` | `#f97316` (Orange)| `rgba(249, 115, 22, 0.12)` | `rgba(249, 115, 22, 0.28)` |
| `PENDING` / `CONFIGURED`| `--fc-status-neutral` | `#64748b` (Slate) | `rgba(100, 116, 139, 0.12)`| `rgba(100, 116, 139, 0.28)`|

---

### 2.2 Typography Scale
Font Family:
- Primary UI: `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Monospace (UUIDs, ports, commands): `'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace`

Disciplined 6-tier scale:
1. **Display / H1** (Page Header): `1.5rem` (24px) • Weight: `700` • Line height: `1.25` • Letter-spacing: `-0.025em`
2. **H2** (Section Header): `1.25rem` (20px) • Weight: `600` • Line height: `1.3` • Letter-spacing: `-0.02em`
3. **H3** (Card / Modal Header): `1.0rem` (16px) • Weight: `600` • Line height: `1.4` • Letter-spacing: `-0.01em`
4. **Body** (Primary text, inputs, table cells): `0.875rem` (14px) • Weight: `400` / `500` • Line height: `1.5`
5. **Small / Labels** (Form labels, button text, badges): `0.8125rem` (13px) • Weight: `500` / `600` • Line height: `1.4`
6. **Caption / Metadata** (Timestamps, UUIDs, hints): `0.75rem` (12px) • Weight: `400` • Line height: `1.4` • Color: `var(--fc-text-muted)`

---

### 2.3 Spacing Grid (4px Base)
Avoid arbitrary margins/paddings. Adhere to:
- `--fc-space-1`: `4px`
- `--fc-space-2`: `8px`
- `--fc-space-3`: `12px`
- `--fc-space-4`: `16px`
- `--fc-space-6`: `24px`
- `--fc-space-8`: `32px`
- `--fc-space-12`: `48px`
- `--fc-space-16`: `64px`

---

### 2.4 Border Radii & Elevation
- `--fc-radius-xs`: `4px` (Tags, code blocks)
- `--fc-radius-sm`: `6px` (Buttons, inputs, badges)
- `--fc-radius-md`: `10px` (Cards, dropdowns, table wrappers)
- `--fc-radius-lg`: `14px` (Modals, main layout shells)
- `--fc-radius-full`: `9999px` (Pills, circular avatars)
- Card Shadow (Dark): `0 1px 3px rgba(0, 0, 0, 0.4)`
- Elevated Shadow (Dark): `0 10px 25px rgba(0, 0, 0, 0.55)`

---

## 3. Reusable UI Primitives (`frontend/src/components/ui/`)

### 3.1 Button (`Button.jsx`)
Standard button component for all interactive triggers.
- **Variants**:
  - `primary`: Solid brand accent with high-contrast text.
  - `secondary`: Subdued surface background with subtle border.
  - `destructive`: Red background / border for irreversible actions.
  - `ghost`: Transparent background, hover highlight.
- **Sizes**: `sm`, `md` (default), `lg`, `icon`.
- **States**:
  - `isLoading`: Shows an inline spinner inside the button, disables click, maintains button width to avoid layout jank.
  - `disabled`: Muted opacity, `cursor: not-allowed`, `pointer-events: none`.
- **Accessibility**: Visible `:focus-visible` ring (`2px solid var(--fc-primary)` with `2px offset`).

### 3.2 Badge (`Badge.jsx`)
Semantic badge for system, application, and operational states.
- **Variants**: `running`, `healthy`, `deploying`, `building`, `failed`, `danger`, `rolled_back`, `pending`, `configured`, `neutral`.
- **Features**: Optional animated pulse dot (`pulse={true}`) for active states like `deploying` or `running`.

### 3.3 Card (`Card.jsx`)
Container component for structured content sections.
- **Subcomponents**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **Extension**: `MetricCard` provides standardized KPI display with Lucide icon, headline number, label, and metadata subtext.

### 3.4 Table (`Table.jsx`)
Stripe-inspired high-density data tables.
- **Subcomponents**: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.
- **Features**: Hairline horizontal borders, sticky headers, subtle row hover highlighting, responsive horizontal scroll container.

### 3.5 Modal (`Modal.jsx`)
Accessible dialog primitive.
- **Features**: `role="dialog"`, `aria-modal="true"`, focus trap, closes on `Escape` key and backdrop click, disables background scrolling when open.
- **Extension (`ConfirmModal`)**: Supports destructive confirmation requiring exact string matching (e.g., typing the application name) before enabling deletion.

### 3.6 EmptyState (`EmptyState.jsx`)
State placeholder for empty queries, tables, and catalogs.
- **Structure**: Centered icon inside subtle accent pill, bold title, descriptive explanation, and primary call-to-action button.

### 3.7 Skeleton (`Skeleton.jsx`)
Content-matching shimmer pulse loaders that replace monolithic spinners.
- **Components**: `Skeleton` (generic rectangular/circular/text), `SkeletonCard`, `SkeletonTableRows`, `SkeletonStatGrid`.

### 3.8 Breadcrumbs (`Breadcrumbs.jsx`)
Accessible path navigation.
- **Markup**: `<nav aria-label="Breadcrumb"><ol>...` with chevron dividers, active page aria attributes (`aria-current="page"`), and truncated paths on mobile.

---

## 4. Responsive Layout Rules

### Breakpoints
- **Mobile**: `<640px`
- **Tablet**: `640px` – `1024px`
- **Desktop**: `>1024px`

### Sidebar Shell Behavior
- **Desktop (`>1024px`)**: Docked sidebar. Supports expand (260px) and collapse (68px icon-only) with clear tooltip labels.
- **Tablet (`768px` – `1024px`)**: Auto-collapses to icon-only mode to preserve content width.
- **Mobile (`<768px`)**: Becomes a slide-in overlay drawer with dark backdrop, triggered by a hamburger button in the header. Never squeezes or horizontally scrolls page content.

### Table-to-Card Responsive Transformation
- On mobile screens (`<768px`), data tables automatically transform into stacked card lists to preserve readability and eliminate horizontal scrolling.

---

## 5. Data Authenticity & Phase Boundaries

1. **Strictly Real API Responses**: All UI elements consume actual data from Phase 4 FastAPI endpoints.
2. **Honest Empty / Scheduled States**:
   - For CPU, Memory, P95 Latency, EKS status, Registry, and Deployments: Display clear status markers such as **"Not available"**, **"Phase 10 planned"**, or **"NOT VERIFIED — REQUIRES AWS ENVIRONMENT"**.
   - No fake numbers, mock charts, or synthetic uptime indicators.
