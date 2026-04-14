# Google Sign-In setup for onlineshop_flutterclient

Backend endpoint already accepts a Google ID token at `POST /auth/google`.

## What was wired in Flutter
- Added `google_sign_in` dependency
- Added `AuthService.loginWithGoogle()` to get Google ID token and call backend
- Added `AuthController.loginWithGoogle()`
- Added `Sign in with Google` button on login screen
- Added Android Google Services Gradle plugin
- Added web Google Sign-In client meta tag + GIS script
- Raised Android minSdk to at least 21

## Still required before Google login works end-to-end

### Android
1. Create or open a Firebase project / Google Cloud OAuth setup
2. Register Android app package:
   - `com.example.onlineshop_flutterclient`
3. Add SHA-1 and SHA-256 fingerprints for the signing key you use
4. Download `google-services.json`
5. Put it here:
   - `android/app/google-services.json`

### Web
1. In Google Cloud / Firebase, create a Web OAuth client
2. Make sure its client ID matches:
   - `1064126993104-d4u7tsa73eo9v9imql46pcvo3tk6io4r.apps.googleusercontent.com`
3. Add authorized JavaScript origins for your web app host

### iOS/macOS
If you plan to support them, add the corresponding Google app config files and platform setup.

## Local validation
Run these from the Flutter app root:

```bash
flutter pub get
flutter analyze
flutter run
```

## Notes
- This repo currently does not contain `google-services.json`
- This repo currently does not contain `GoogleService-Info.plist`
- `flutter` was not available in PATH in the current environment, so build verification could not be completed here
