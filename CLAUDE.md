# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npx expo start          # Start dev server (press i for iOS sim, a for Android emu)
npx expo start --ios    # Start directly on iOS simulator
npx expo start --android
npx expo start --web
npm run lint            # ESLint via expo lint (flat config)
```

No test runner is configured yet.

## Architecture

**Subscription tracker app** built with Expo SDK 54, React Native 0.81, Expo Router 6 (file-based routing), and NativeWind 5 (Tailwind CSS 4 for React Native).

### Routing (Expo Router, file-based)

- `app/_layout.tsx` — Root Stack, loads PlusJakartaSans fonts, controls splash screen
- `app/(tabs)/_layout.tsx` — Bottom tab navigator (Home, Subscriptions, Insights, Settings). Tab config is data-driven from `constants/data.ts` `tabs` array
- `app/(auth)/` — Auth group (sign-in, sign-up) — scaffolded, not yet implemented
- `app/onboarding.tsx` — Scaffold only
- `app/subscriptions/[id].tsx` — Dynamic route for subscription detail

### Styling

- **NativeWind 5** with Tailwind CSS 4. Metro integration via `metro.config.js` → `withNativewind()`
- **`global.css`** — Design tokens (`@theme` block for colors, spacing, fonts) and all component classes (`@layer components`). This is the single source for reusable styles — components use className strings like `"sub-card"`, `"home-balance-card"`, `"auth-input"` etc.
- **`constants/theme.ts`** — Same color/spacing tokens exported as JS objects for use in inline `style` props (e.g., tab bar positioning)
- `styled()` from NativeWind wraps `SafeAreaView` since it's a third-party component
- `clsx` for conditional class merging

### Data Layer

All data is currently hardcoded in `constants/data.ts` (no backend/API). This includes:
- `tabs` — Tab bar configuration
- `HOME_USER`, `HOME_BALANCE` — Dashboard display data
- `UPCOMING_SUBSCRIPTIONS`, `HOME_SUBSCRIPTIONS` — Subscription lists

### Type System

- Global types declared in `type.d.ts` (ambient `declare global`): `Subscription`, `SubscriptionCardProps`, `UpcomingSubscription`, `AppTab`, etc.
- Image module declarations in `image.d.ts` (`.png`, `.jpg`, `.svg`, `.gif`)
- Path alias: `@/*` maps to project root

### Key Conventions

- **Fonts**: PlusJakartaSans family loaded at root layout via `expo-font`, referenced as `font-sans`, `font-sans-bold`, etc. in Tailwind
- **Icons/Images**: All assets centralized through `constants/icons.ts` and `constants/images.ts` as typed `require()` imports
- **Utilities**: `lib/utils.ts` — `formatCurrency()`, `formatSubscriptionDateTime()`, `formatStatusLabel()`
- **New Architecture** and **React Compiler** are enabled (`app.json` → `newArchEnabled: true`, `experiments.reactCompiler: true`)
- **Typed Routes** enabled (`experiments.typedRoutes: true`)
