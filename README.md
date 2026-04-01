# Online Shop Flutter Client

A Flutter/Dart mobile client (inspired by eBay's shopping UX) for the Sem4 online shop backend found in
`C:/Users/DNC/Desktop/Sem4-projectShop/onlineshop_project_19_3_2026/onlineshop_project`.

## Features
- Email/password authentication against `/auth/login`
- Home feed with hero banner, category chips, and curated product carousels
- Search & category catalog grid with filters
- Product detail screen with gallery, description, and add-to-cart support
- Local cart management with quantity controls
- Account/profile area with logout + API status display
- Provider-based state management + persistent JWT storage via `SharedPreferences`

## Getting Started
1. Install Flutter (3.19+) and enable Windows/Android/iOS targets.
2. From this directory run:
   ```bash
   flutter pub get
   flutter run
   ```
3. Ensure the Spring Boot backend is running on `http://10.0.2.2:9999` for Android emulators
   (or adjust `ApiConfig.baseUrl` in `lib/core/constants.dart`).

## Project Structure
```
lib/
  core/        # networking, models, storage, theme
  features/    # UI modules (auth, home, catalog, cart, profile)
  widgets/     # shared presentation components
```

## Environment Notes
- Default base URL: `http://10.0.2.2:9999` (Android emulator). Change to `http://localhost:9999` for desktop.
- The client expects the backend schema introduced on 2026-03-18 (multi-category products, JWT auth).
