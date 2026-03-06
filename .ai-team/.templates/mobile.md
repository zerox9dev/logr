# Template: Mobile App

Use this template when building a cross-platform mobile app (iOS + Android).

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React Native + Expo SDK 52+ | 80-90% code sharing, huge ecosystem, New Architecture |
| Language | TypeScript | Type safety |
| Navigation | Expo Router (file-based) | Next.js-like routing for mobile |
| UI | Tamagui or NativeWind (Tailwind) | Cross-platform styled components |
| State | Zustand or Jotai | Lightweight, no boilerplate |
| Data fetching | TanStack Query | Caching, background sync, optimistic updates |
| Backend | Supabase or Firebase | Auth, database, storage, push notifications |
| Push | Expo Notifications | Cross-platform push |
| Storage | expo-secure-store | Encrypted local storage for tokens |
| OTA updates | EAS Update | Push JS updates without app store review |
| Build | EAS Build | Cloud builds for iOS + Android |
| Testing | Jest + React Native Testing Library | Component + integration tests |

## Alternative: Flutter

| Layer | Technology |
|-------|-----------|
| Framework | Flutter 3.x |
| Language | Dart |
| State | Riverpod |
| Backend | Supabase or Firebase |
| Build | `flutter build` |

Choose Flutter if: custom UI/animations are critical, or team knows Dart.
Choose React Native if: team knows React/TypeScript, web code sharing needed.

## Project Structure (Expo)

```
app/
├── (tabs)/
│   ├── index.tsx          # Home tab
│   ├── search.tsx         # Search tab
│   └── profile.tsx        # Profile tab
├── (auth)/
│   ├── login.tsx
│   └── signup.tsx
├── [id].tsx               # Dynamic route
├── _layout.tsx            # Root layout
components/
├── ui/                    # Reusable UI components
├── forms/                 # Form components
lib/
├── api/                   # API client
├── auth/                  # Auth helpers
├── store/                 # Zustand stores
assets/
├── images/
└── fonts/
```

## Key Patterns

- **Expo Router** for file-based navigation (like Next.js App Router)
- **Deep linking** configured from day one
- **Offline-first** with TanStack Query + persisted cache
- **Haptic feedback** for touch interactions
- **Safe areas** — always use `SafeAreaView`
- **Skeleton screens** over spinners
- **60fps** — avoid unnecessary re-renders, use `memo` + `useCallback`

## Agents should know:

- PM: Mobile = offline support, push notifications, app store submission
- Designer: Touch targets ≥44px, safe areas, bottom navigation, gestures
- Engineer: Expo Router, New Architecture, EAS Build for releases
- QA: Test on both iOS + Android, test offline mode, test deep links
