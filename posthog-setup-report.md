<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurly subscription tracker app. Here's a summary of all changes made:

- **`app.config.js`** — Converted from static `app.json` to dynamic `app.config.js` so PostHog token and host can be injected from `.env` via `process.env`. Added `extra.posthogProjectToken` and `extra.posthogHost`.
- **`lib/posthog.ts`** — New PostHog client module. Reads config from `expo-constants` (populated by `app.config.js`), disables itself gracefully if the token is missing, and configures batching, lifecycle capture, and retry settings.
- **`app/_layout.tsx`** — Wraps the app in `PostHogProvider` with autocapture (touches, no automatic screen tracking). A `ScreenTracker` component manually calls `posthog.screen()` on every Expo Router pathname change.
- **`app/(auth)/sign-in.tsx`** — Captures `user_signed_in` and calls `posthog.identify()` with the user's email on successful login. Captures `$exception` on unexpected errors.
- **`app/(auth)/sign-up.tsx`** — Captures `user_signed_up` and calls `posthog.identify()` with the user's email after email verification completes.
- **`app/(tabs)/settings.tsx`** — Captures `user_signed_out` and calls `posthog.reset()` before signing out to end the PostHog session.
- **`app/(tabs)/index.tsx`** — Captures `subscription_card_expanded` with `subscription_id` and `subscription_name` when a card is expanded on the home screen.
- **`app/subscriptions/[id].tsx`** — Captures `subscription_detail_viewed` with `subscription_id` when the detail screen mounts.

## Events

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signs in with email and password via Clerk | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User completes registration and email verification via Clerk | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out from the Settings screen | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expands a subscription card on the home screen to see details | `app/(tabs)/index.tsx` |
| `subscription_detail_viewed` | User navigates to the subscription detail page | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1653047)
- [New sign-ups over time](/insights/OFngSVUk)
- [Sign-ins over time](/insights/nzg6SMZl)
- [Sign-up to subscription engagement funnel](/insights/S4azhcND)
- [Subscription engagement](/insights/T2GP1zKM)
- [Sign-outs (churn indicator)](/insights/QkPIKXEI)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
