# The Grid — Interactive 3D Portfolio

## Overview
 "The Grid" is an interactive, scroll/click-navigated 3D portfolio experience built with:
- **Next.js 14** + **React Three Fiber** (Three.js via R3F)
- **@react-three/drei** for helpers
- **Framer Motion** for 2D UI overlays
- Dark, low-poly server-room/data-center environment with fixed camera viewpoints

## Theme: "The Grid"
A dark, low-poly server-room/data-center environment floating in a void, styled like a physical homelab. Features:
- Dark base palette with amber and teal accent lighting
- Glowing server racks, floating terminal monitors
- Subtle particle/data-stream effects
- Soft ambient light pulsing (not literal audio)
- 4 fixed camera "stations" representing portfolio sections

## 4 Camera Stations

### 1. Entry / Hero Station
- My name, title, short intro
- Glowing "server core" centerpiece
- CTA buttons for Projects and Certifications

### 2. Projects Station
- Each real project rendered as a glowing terminal/monitor object
- Clicking one opens a detail panel with the project's real description, tech stack, and link
- 5 real projects from the existing portfolio

### 3. Certifications/Skills Station
- Status lights or progress rack
- In-progress vs completed certs visually distinct
- 8 skill categories with progress indicators

### 4. Contact/Resume Station
- Terminal prompt object that opens a contact form or resume download
- Contact info and social links

## Navigation
- User scrolls or clicks directional hotspots to move between stations
- No WASD free-roam, no VR controls
- Mobile-friendly with auto-detection of low-power devices

## Performance & Mobile Fallback
- **Reduced motion**: Particle effects disabled on `prefers-reduced-motion: reduce`
- **Low-power mode**: Simplified geometry on screens <768px or mobile user agents
- **Lazy loading**: Station content loads per-section (not the whole scene upfront)
- **Reduced particle count**: 10 data particles instead of 20, 8 amber particles instead of 15
- **Simpler geometry**: Box geometries for server racks instead of complex models

## Tech Stack
- Next.js 14 + React 19
- React Three Fiber & Drei
- Framer Motion for UI overlays
- Tailwind CSS with oklch color scheme
- Amber (`oklch(0.70 0.25 40)`) and Teal (`oklch(0.60 0.20 160)`) accent colors

## Docker / Coolify Deployment
- Multi-stage Dockerfile based on `node:20-alpine`
- Production build: `npm run build`
- Runs on port 3000
- Designed for Coolify deployment pipeline
- `start.sh` entry point

## Project Structure
```
src/
  app/          Next.js 14 app directory
  components/
    grid-scene.tsx    Main R3F canvas with 4 stations
    station-entry.tsx   Hero/Entry station
    station-projects.tsx Projects station
    station-certifications.tsx  Certifications/Skills station
    station-contact.tsx   Contact/Resume station
    grid-scene.tsx        Main R3F canvas
  lib/
    data.ts   Portfolio content from existing site
```

## What Still Needs Sourcing
- **3D models**: Currently using simple BoxGeometry / SphereGeometry - custom low-poly server rack models can be added later
- **Textures**: All materials use solid colors via Tailwind CSS oklch variables - texture maps not required
- **Audio**: No literal audio (as requested) - ambient visual motion only

## Running Locally
```bash
npm install          # install dependencies
npm run build        # build for production
npm run dev          # start development server
```

## Deployment
This project builds and runs cleanly through the GitHub → Coolify → Unraid pipeline, following the same Docker pattern as the existing jj.jewellcore.com site.

## Color Tokens
- Background (light): `oklch(0.985 0 0)`
- Background (dark): `oklch(0.10 0.02 260)`
- Amber accent: `oklch(0.70 0.25 40)`
- Teal accent: `oklch(0.60 0.20 160)`
- Card (dark): `oklch(0.15 0.02 260)`
- Foreground (dark): `oklch(0.985 0 0)`