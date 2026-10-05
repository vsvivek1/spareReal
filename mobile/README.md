# spareX mobile app

Flutter app for Android and iOS with the same features as the web app:
browse, sell and request spare parts, find services nearby, book workshop
slots, and manage your listings, requests and bookings. It uses the same
Firebase project and calls the web app's API routes for login and booking,
so data is shared with the website.

## Run locally

```bash
cd mobile
flutter pub get
flutter run \
  --dart-define=FIREBASE_API_KEY=... \
  --dart-define=FIREBASE_MESSAGING_SENDER_ID=... \
  --dart-define=FIREBASE_STORAGE_BUCKET=... \
  --dart-define=FIREBASE_ANDROID_APP_ID=... \
  --dart-define=FIREBASE_IOS_APP_ID=... \
  --dart-define=GOOGLE_SERVER_CLIENT_ID=... \
  --dart-define=MSG91_WIDGET_ID=... \
  --dart-define=MSG91_TOKEN_AUTH=... \
  --dart-define=API_BASE=https://your-production-domain
```

`API_BASE` defaults to `https://spare-real.vercel.app`; set it if the site
lives on another domain.

## One-time setup

1. **Firebase:** in Project settings → Your apps, add an Android app with
   package `com.calecutech.sparex` and an iOS app with bundle ID
   `com.calecutech.sparex`. Copy each app ID into `FIREBASE_ANDROID_APP_ID` /
   `FIREBASE_IOS_APP_ID`. Add your upload key's and Play's app-signing SHA-1
   and SHA-256 to the Android app so Google sign-in works.
2. **Google sign-in:** `GOOGLE_SERVER_CLIENT_ID` is the *Web client* ID under
   Authentication → Sign-in method → Google.
3. **MSG91:** turn on *Mobile Integration* for the OTP widget, otherwise SMS
   login fails from the app.

## Store release

`.github/workflows/mobile.yml` analyzes, tests and builds on every push that
touches `mobile/`. The signed `.aab` and `.apk` are attached to each run.

Repo secrets it uses (Settings → Secrets and variables → Actions):

| Secret | What |
| --- | --- |
| `FIREBASE_API_KEY`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_STORAGE_BUCKET` | Same as the web's `NEXT_PUBLIC_FIREBASE_*` |
| `FIREBASE_ANDROID_APP_ID`, `FIREBASE_IOS_APP_ID` | From step 1 |
| `GOOGLE_SERVER_CLIENT_ID` | From step 2 |
| `MSG91_WIDGET_ID`, `MSG91_TOKEN_AUTH` | Same as the web's `NEXT_PUBLIC_MSG91_*` |
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 upload.jks` of your upload keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Its password. `ANDROID_KEY_ALIAS` (default `upload`) and `ANDROID_KEY_PASSWORD` (default: the keystore password) are optional |
| `PLAY_SERVICE_ACCOUNT_JSON` | Play Console service account with release permission |

Create the upload keystore once:

```bash
keytool -genkey -v -keystore upload.jks -keyalg RSA -keysize 2048 \
  -validity 10000 -alias upload
```

**Google Play (fastlane):** from `mobile/android`, with your Play
service-account key at `play-key.json` (or `SUPPLY_JSON_KEY`) and your
upload keystore in `android/key.properties`:

```bash
DART_DEFINES="--dart-define=FIREBASE_API_KEY=... --dart-define=FIREBASE_ANDROID_APP_ID=..." \
  fastlane internal     # build and upload to internal testing
fastlane production     # promote the latest internal build
```

Create the app in Play Console (package `com.calecutech.sparex`) with its store
listing, privacy policy and Data safety form before the first upload. CI can
also upload: run the *Mobile app* workflow with "Upload to Google Play"
ticked once the secrets above are set.

**App Store:** needs an Apple Developer account and a Mac (or a CI service
with signing). The workflow only checks that the iOS app compiles. To ship,
open `ios/Runner.xcworkspace` in Xcode, set your team, then
`flutter build ipa` and upload with Transporter.
