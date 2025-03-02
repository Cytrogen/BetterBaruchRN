# BetterBaruch-RN: Campus Club Explorer

BetterBaruch-RN is a React Native application designed to help Baruch College students discover and connect with campus clubs and organizations.

## For Users

### Installation

#### Android

1. Go to the [Releases](https://github.com/Cytrogen/BetterBaruchRN/releases) page
2. Download the latest `app-release-signed.apk` file
3. Open the APK on your Android device to install

#### iOS

Currently, iOS builds are not available as they require a macOS environment for compilation. If you're interested in helping with iOS builds, please see the Contributing section.

### Features

- Browse all campus clubs and organizations
- View detailed club information including contact details and social media links 
- Dark mode support
- Clean, intuitive interface optimized for mobile

## For Developers

### Setting Up the Development Environment

1. Clone the repository

   ```bash
   git clone https://github.com/Cytrogen/BetterBaruchRN.git
   cd BetterBaruchRN
   ```
   
2. Install dependencies

   ```bash
   yarn install
   ```

3. Set up the keystore for Android builds

   - Navigate to the `android/app` directory
   - Copy `keystore.properties.example` to `keystore.properties`
   - Update the properties with your keystore information

4. Start the development server

   ```bash
   npx react-native start
   ```
   
5. Run the app on a device or emulator

   ```bash
   npx react-native run-android
   ```
   
### Building a Release APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at `android/app/build/outputs/apk/release/app-release.apk`.

## Technology Stack

- Frontend: React Native
- State Management: Zustand
- Styling: TailwindCSS (twrnc)
- Data Extraction: React Native WebView
- Navigation: React Navigation
- Icons: React Native Vector Icons

## Disclaimer

> This application is not officially affiliated with, authorized, maintained, sponsored, or endorsed by Baruch College or any of its affiliates or subsidiaries. This is an independent and unofficial application. All club information is sourced from publicly available data on the Baruch Engage platform.
>
> The developers of this application are not responsible for any inaccuracies in the displayed information. For official information, please refer to the [Baruch College Engage Platform](https://baruch.campuslabs.com/engage/organizations).

## License

This project is licenses under the MIT License - see the [LICENSE](/LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

### Areas for Contribution

- [ ] iOS build support
- [ ] Club filtering and search functionality
- [ ] Upcoming club events integration
- [ ] UI/UX improvements
- [ ] Performance optimizations

---

Made with ❤️ for Baruch College students
