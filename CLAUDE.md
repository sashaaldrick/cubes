# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Server

The user has their own dev server running at all times. Do not start the dev server with `npm run dev` unless explicitly asked.

## Commands

### Development
- `npm run dev` - Start development server with hot module replacement
- `npm run dev -- --open` - Start dev server and open in browser
- `npm run build` - Build production-ready application
- `npm run preview` - Preview production build locally
- `npm run check` - Run TypeScript type checking
- `npm run check:watch` - Run type checking in watch mode

## Architecture

This is a SvelteKit application using:
- **Svelte 5** with new runes syntax (`$state`, `$derived`, etc.)
- **TypeScript** with strict checking enabled
- **Vite** as the build tool
- **File-based routing** in `src/routes/`

### Key Directories
- `src/routes/` - File-based routing (e.g., `+page.svelte` for route pages)
- `src/lib/` - Shared components/utilities (accessible via `$lib` alias)
- `static/` - Static assets served directly

### Important Patterns
- Routes are defined by file structure in `src/routes/`
- `+page.svelte` files define route components
- `+layout.svelte` files define shared layouts
- `+server.ts` files define server-side endpoints
- Components in `src/lib/` can be imported using `$lib/component-name`