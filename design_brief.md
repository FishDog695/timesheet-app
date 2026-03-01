# Design System Guidelines

> **Note:** This file contains general design principles. If a `project_design.md` file exists in your project, those project-specific guidelines take precedence over these general guidelines.

---

## General Styling Principles

### 1. The Container Principle

* **Never use full width.** The primary content of the page must be contained within a centered container.

* On desktop, this container should have a `max-width` (e.g., `max-w-7xl` in Tailwind) and generous horizontal padding (`px-4` or `px-8`).

* On mobile, the container should be fluid but still have comfortable horizontal padding to prevent content from touching the screen edges (`px-4`).

### 2. Mobile-First & Responsive Design

* Design and build for mobile screens first. This means starting with mobile styles and then adding larger screen breakpoints (`sm:`, `md:`, `lg:`) to enhance the layout for desktops.

* Use responsive utility classes extensively for padding, margins, font sizes, and grid layouts.

* Example: `py-16 md:py-24` (more vertical space on desktop), `grid-cols-1 md:grid-cols-2` (single column on mobile, two on desktop).

### 3. Light Theme & Color Palette (Standard)

* The default background should be a light gray or white (`bg-gray-50` or `bg-white`).

* Text should be a dark gray or black (`text-gray-900` or `text-black`).

* **Gradients are key.** Use subtle, radial or linear gradients for hero sections and accent elements.

* The color palette should be professional and clean, using a single primary accent color.

### 4. Dark Theme & Color Palette (Optional)

* The default background should be a dark gray or black (`bg-gray-950` or similar).

* Text should be white or a light gray (`text-white` or `text-gray-200`).

* **Gradients are key.** Use subtle, radial or linear gradients as backgrounds for hero sections, cards, and accent elements.

* The color palette should be restrained, primarily using blues, purples, and pinks for highlights and accents, often in gradient form.

* Use a soft, non-white glow or shadow effect to make elements pop against the dark background.

### 5. Typography

* Use a clean, sans-serif font like Inter, Poppins, or a similar one.

* Heading fonts should be bold and prominent (`font-bold text-4xl sm:text-5xl lg:text-6xl`).

* Body text should be legible with sufficient line height and be a lighter shade than headings for hierarchy.

* Use a font-smoothing class (`antialiased`) for a cleaner look.

### 6. Buttons and Interactive Elements

* Buttons should have a slight gradient or glow effect.

* Use `shadcn/ui` buttons as a base (`Button`). Customize with gradients or shadows.

* Interactive elements should have clear hover and focus states, often with a subtle color change or scale effect.

* Use rounded corners on all elements—buttons, cards, forms, and images (`rounded-xl` or `rounded-2xl`).

---

## Typical Landing Page Sections

### 1. Hero Section

**Structure:**
* A prominent, large headline that is short and impactful.
* A compelling sub-headline or description.
* A primary call-to-action (CTA) button.
* An optional secondary CTA (e.g., "Learn More" or a link).
* A visual element, like an app screenshot, a 3D model, or an abstract graphic.

**Styling:**
* The entire section should have a light or dark, often gradient, background depending on the chosen theme.
* Text should be centered on mobile and left-aligned in the container on desktop.
* The visual element should be a key focal point.

**Example Classes:**
```
Container: container mx-auto px-4 py-16 md:py-24
Headline: text-4xl sm:text-5xl lg:text-6xl font-bold
Subheadline: text-lg md:text-xl text-gray-600 dark:text-gray-400
CTA Button: bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl
```

### 2. Features Section

**Structure:**
* A section headline and sub-headline.
* A grid of feature cards.
* Each card should have an icon or small graphic, a title, and a brief description.

**Styling:**
* Cards should have a slightly different background color or a subtle border to stand out from the page.
* Use a responsive grid (e.g., `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).

**Example Classes:**
```
Section: py-16 md:py-24 bg-gray-50 dark:bg-gray-900
Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
Card: bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg
Icon: w-12 h-12 text-blue-500
Title: text-xl font-bold mb-2
Description: text-gray-600 dark:text-gray-400
```

### 3. Testimonials Section

**Structure:**
* A section headline (e.g., "What Our Users Say").
* A grid or carousel of testimonial cards.
* Each card should include a user's name, their role or company, a profile picture (optional), and the testimonial text.

**Styling:**
* Cards should follow the same rounded theme as the feature cards.
* The user's name and role should be styled differently to create hierarchy.
* Testimonial text should be quoted or styled to stand out.

**Example Classes:**
```
Section: py-16 md:py-24
Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
Card: bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg
Quote: text-gray-700 dark:text-gray-300 italic mb-4
Name: font-bold text-gray-900 dark:text-white
Role: text-sm text-gray-500 dark:text-gray-400
```

### 4. Pricing / Plan Comparison

**Structure:**
* A headline like "Pricing" or "Discover a plan for you."
* A responsive grid of pricing cards.
* Each card should detail the plan name, price, and a bulleted list of features.

**Styling:**
* One plan (usually the most popular) can be highlighted with a different background or a prominent border.
* Use `shadcn/ui` components for buttons and lists.
* Make sure the features list is clear and easy to read.

**Example Classes:**
```
Section: py-16 md:py-24
Grid: grid grid-cols-1 md:grid-cols-3 gap-6
Card: bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg
Featured Card: ring-2 ring-blue-500 transform scale-105
Plan Name: text-2xl font-bold mb-2
Price: text-4xl font-bold mb-6
Features List: space-y-3 mb-6
Feature Item: flex items-center text-gray-600 dark:text-gray-400
```

### 5. FAQs Section

**Structure:**
* A headline for the section.
* A series of accordion-style questions and answers.

**Styling:**
* Use `shadcn/ui`'s `Accordion` component as a base.
* The questions should be clear, and the answers should appear smoothly upon clicking.

**Example Classes:**
```
Section: py-16 md:py-24 bg-gray-50 dark:bg-gray-900
Container: max-w-3xl mx-auto
Accordion: space-y-4
Question: font-semibold text-lg
Answer: text-gray-600 dark:text-gray-400 pt-2
```

---

## Key CSS / Tailwind Classes to Leverage

### Layout & Spacing
* `container` - Center content with max-width
* `mx-auto` - Center horizontally
* `px-4 md:px-8` - Consistent horizontal padding
* `py-16 md:py-24` - Generous vertical spacing with responsive scaling

### Backgrounds (Light Theme)
* `bg-white` - Clean white background
* `bg-gray-50` - Subtle gray background
* `bg-gradient-to-br from-blue-500 to-cyan-500` - Gradient accents

### Backgrounds (Dark Theme)
* `bg-gray-950` - Deep dark background
* `bg-gray-900` - Slightly lighter dark section
* `bg-gradient-to-br from-purple-500 to-pink-500` - Dark theme gradients

### Text Colors
* Light theme: `text-gray-900`, `text-black`
* Dark theme: `text-white`, `text-gray-200`
* Muted text: `text-gray-600` (light), `text-gray-400` (dark)

### Visual Effects
* `rounded-2xl` - Rounded corners on all elements
* `shadow-lg` - Depth for cards and sections
* `transition-all duration-300` - Smooth hover effects
* `hover:scale-105` - Subtle scale on hover

### Flexbox & Grid
* `flex items-center justify-center` - Center elements
* `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Responsive grids
* `gap-6` - Consistent spacing in grids

### Typography
* `font-bold text-4xl sm:text-5xl lg:text-6xl` - Responsive hero headings
* `text-lg md:text-xl` - Responsive body text
* `antialiased` - Smooth font rendering

---

## Responsive Breakpoints

Remember Tailwind's default breakpoints:
* `sm:` - 640px and up (tablets)
* `md:` - 768px and up (small desktops)
* `lg:` - 1024px and up (desktops)
* `xl:` - 1280px and up (large desktops)
* `2xl:` - 1536px and up (extra large)

Always start mobile-first (no prefix), then add breakpoint modifiers for larger screens.