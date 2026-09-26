# AyoHadir — Project Instructions

## Project
AyoHadir is a Flutter Android attendance application built from scratch. The backend target is Supabase. Development must stay modular and incremental.

## Current stage
Foundation only. Do not add authentication, QR scanning/generation, GPS, offline sync, realtime, or other product features unless explicitly requested.

## Technology
- Flutter / Dart
- Material 3
- Supabase will be integrated later
- Android release target

## Architecture
- `lib/core/`: cross-feature concerns such as constants, models, routing, services, theme, and shared widgets.
- `lib/features/`: feature modules. Keep feature-specific UI and logic inside its feature folder.
- `lib/test/` or `test/`: tests corresponding to application behavior.

## Coding rules
- Keep code null-safe and analyzer-clean.
- Prefer small, testable widgets and services.
- Do not place secrets in source control.
- Never hard-code Supabase service-role keys or other private credentials.
- Do not rewrite unrelated files when implementing a task.
- Preserve existing behavior unless the task explicitly changes it.
- Run formatting, static analysis, and tests after meaningful changes.
- Use clear, conventional Dart naming.

## Git workflow
- Work in small, reviewable commits.
- Commit messages should describe the change clearly.
- Avoid committing generated build artifacts.

## Build verification
Expected checks for a Flutter project:

```text
flutter pub get
dart format --output=none --set-exit-if-changed .
flutter analyze
flutter test
flutter build apk --release
```

The repository's GitHub Actions workflow is the authoritative automated check when available.

## Agent behavior
Before changing code:
1. Read the relevant files and understand existing structure.
2. Make the smallest complete change for the requested task.
3. Validate the change.
4. Summarize files changed and any validation that could not be run.
