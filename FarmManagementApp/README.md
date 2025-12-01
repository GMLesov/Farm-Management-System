# 🌱 AgriReach Digital - Farm Management App (MVP)

**Smart Farm Management System for Zimbabwe and Beyond**

A comprehensive React Native application that digitizes farm operations, enabling real-time monitoring, predictive insights, and improved productivity from any Android device.

![Platform](https://img.shields.io/badge/platform-Android-green)
![React Native](https://img.shields.io/badge/React%20Native-0.73-blue)
![Firebase](https://img.shields.io/badge/Firebase-Backend-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Vision

To revolutionize agricultural management by empowering farmers, workers, and managers with a smart, data-driven mobile app that digitizes daily farm operations — enabling real-time monitoring, predictive insights, and improved productivity.

## ✨ Key Features

### 👥 User Roles
- **🧑‍💼 Farm Manager**: Complete farm oversight, task assignment, analytics
- **🧑‍🌾 Farm Worker**: Task completion, data entry, progress reporting

### 📱 Core Modules

#### 🐄 Animal Management
- Track livestock (cattle, pigs, goats, sheep, chickens)
- Record feeding schedules, weights, and health status
- Vaccination tracking and medical history
- Photo documentation

#### 🌾 Crop Management
- Crop lifecycle tracking (planting to harvest)
- Fertilizer and irrigation management
- Pest control logging
- Yield monitoring and analysis

#### ✅ Task Management
- Create and assign tasks to workers
- Real-time progress tracking
- Photo proof of completion
- Recurring task automation

#### 📊 Dashboard & Analytics
- Live farm metrics and KPIs
- Visual charts and trends
- Financial tracking (expenses/revenue)
- Performance insights

## 🛠 Technology Stack

### Frontend (Mobile)
- **React Native 0.73** - Cross-platform mobile development
- **React Navigation 6** - Screen navigation and routing
- **React Native Paper** - Material Design UI components
- **Redux Toolkit** - State management
- **Formik + Yup** - Form handling and validation

### Backend & Data
- **Firebase Authentication** - User management and security
- **Firestore** - Real-time NoSQL database
- **Firebase Storage** - Photo and file storage
- **Firebase Cloud Messaging** - Push notifications

### Offline & Performance
- **Firestore Offline Persistence** - Primary offline solution
- **React Native SQLite** - Local database backup
- **@react-native-community/netinfo** - Network status monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Git

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Firebase Setup**
   - Follow the detailed [Firebase Setup Guide](./FIREBASE_SETUP.md)
   - Add your `google-services.json` to `android/app/`
   - Update Firebase config in `src/services/firebase.ts`

3. **Start Metro bundler**
   ```bash
   npm start
   ```

4. **Run on Android**
   ```bash
   npm run android
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── auth/           # Login/Signup screens
│   ├── manager/        # Manager-specific screens
│   ├── worker/         # Worker-specific screens
│   ├── animals/        # Animal management screens
│   ├── crops/          # Crop management screens
│   └── tasks/          # Task management screens
├── navigation/         # Navigation configuration
├── services/           # API and external services
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

For detailed setup instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

---

**Built with ❤️ for farmers in Zimbabwe and beyond**

*Empowering agriculture through technology* 🌱

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
