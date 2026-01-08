# E2E Tests with Maestro

This directory contains end-to-end tests using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

1. Install Maestro CLI:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. Build and install the app on your device/emulator:
   ```bash
   npm run android:build
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

3. Configure merchant settings in the app before running tests

## Running Tests

### Run all tests
```bash
maestro test e2e/
```

### Run specific test
```bash
maestro test e2e/payment-flow.yaml
```

### Run with Maestro Studio (interactive debugging)
```bash
maestro studio
```

## Test Files

| File | Description |
|------|-------------|
| `payment-flow.yaml` | Basic payment flow: New sale → Enter amount → QR code → Copy URL |

## Adding New Tests

1. Create a new `.yaml` file in this directory
2. Start with `appId: com.reown.pos`
3. Add test steps using Maestro commands

### Common Maestro Commands

```yaml
# Tap on text
- tapOn: "Button Text"

# Tap on element by testID
- tapOn:
    id: "my-test-id"

# Assert element is visible
- assertVisible:
    text: "Expected Text"

# Wait for element with timeout
- extendedWaitUntil:
    visible:
      id: "element-id"
    timeout: 10000

# Type text
- inputText: "Hello World"

# Scroll
- scroll

# Take screenshot
- takeScreenshot: "screenshot-name"
```

## Notes

- Tests require the app to have merchant credentials configured
- Payment simulation is not yet implemented (pending backend support)
- Run on a real device or emulator with network access
