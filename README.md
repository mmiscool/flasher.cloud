# flasher.cloud

<p align="center">
  <img src="./logo.svg" alt="flasher.cloud logo" width="420" />
</p>

flasher.cloud is a browser-hosted workbench for flashing and diagnosing
microcontrollers with Web Serial and WebUSB. The goal is to collect useful open
source flashing workflows into one site, while keeping each utility hosted
locally instead of sending users to a different tool for every board family.

The current app is built with plain JavaScript and Vite. It uses a shared UI for
device selection, flasher pages, progress output, logs, and package/reference
links, while still allowing each flasher to expose the controls its protocol
needs.

## What It Does

- Installs ESP firmware from ESP Web Tools manifests.
- Flashes raw ESP BIN files with explicit offsets through Web Serial.
- Writes DFU and DfuSe firmware over WebUSB.
- Validates UF2 files and triggers 1200-baud bootloader reset.
- Flashes CMSIS-DAP / DAPLink probes over WebUSB.
- Talks to STM serial ROM bootloaders over Web Serial.
- Flashes common AVR / Arduino STK500v1 bootloaders from Intel HEX files.
- Sends raw firmware files over a generic serial connection.
- Provides a hosted serial terminal for logs, REPLs, AT commands, and smoke
  checks.
- Generates ESP Web Tools manifest JSON.
- Provides a compatibility matrix that maps device families to the matching
  hosted flasher page.

## Supported Device Families

The site is organized around a long list of board and chip families, including:

- Espressif: ESP8266, ESP32, ESP32-S2, ESP32-S3, ESP32-C2, ESP32-C3, ESP32-C5,
  ESP32-C6, ESP32-C61, ESP32-H2, and ESP32-P4.
- UF2 boards: Raspberry Pi Pico, RP2040, RP2350, BBC micro:bit, Adafruit SAMD21,
  Adafruit SAMD51, Seeed XIAO, Arduino Nano 33, and nRF52840.
- USB DFU devices: STM32 DFU, STM32F1, STM32F4, STM32H7, GD32 DFU, Particle
  boards, CH32V, and CH55x.
- CMSIS-DAP / DAPLink devices: DAPLink probes, CMSIS-DAP probes, LPC boards,
  Kinetis boards, SAMD through a debug probe, and nRF52 through a debug probe.
- STM serial bootloader devices: STM32 UART bootloader, STM32F0, STM32F1,
  STM32F3, STM32F4, STM32G0, STM32L0, and GD32 UART.
- AVR and serial bootloader devices: Arduino Uno, Arduino Nano, Pro Mini,
  ATmega328P, ATmega168, ATmega32U4, Arduino Mega, BL602, BL616, RTL8710,
  Kendryte K210, Maix boards, Teensy, and generic UART devices.

Some device families share the same hosted flasher utility when they use the
same transport or bootloader protocol.

## Browser Requirements

Web Serial and WebUSB require a secure browser context. Use HTTPS in production
or `localhost` during development. These APIs are best supported in Chromium
browsers such as Chrome and Edge.

## Main Dependencies

- `esp-web-tools` for ESP manifest installers.
- `esptool-js` for raw Espressif BIN flashing.
- `dfu` for WebUSB DFU and DfuSe workflows.
- `dapjs` for CMSIS-DAP / DAPLink flashing.
- `@xterm/xterm` for the hosted serial terminal.

Each flasher page also includes links to the packages, specifications, or
references used by that page.

## Development

```sh
npm install
npm run dev
```

Vite prints the local development URL after startup. Web Serial and WebUSB work
from `localhost`.

## Build

```sh
npm run build
```

The production build is written to `dist/`.
