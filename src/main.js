import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { WebDFU } from "dfu";
import { ESPLoader, Transport } from "esptool-js";
import "esp-web-tools/dist/web/install-button.js";
import logoUrl from "../logo-option4-transparent.png";
import "./styles.css";

const flashers = {
  "esp-manifest": {
    title: "ESP manifest installer",
    eyebrow: "Hosted ESP Web Tools",
    utility: "ESP manifest",
    transport: "Web Serial",
    kicker: "ESPHome-style manifests for ESP8266 and ESP32-family firmware.",
    summary:
      "Render a bundled ESP Web Tools installer from a manifest path or URL. This is the best fit for products that publish a firmware manifest and want automatic chip selection.",
    devices: ["ESP8266", "ESP32", "ESP32-S2", "ESP32-S3", "ESP32-C3", "ESP32-C6"],
    references: [
      ["NPM: esp-web-tools", "https://www.npmjs.com/package/esp-web-tools"],
      ["GitHub: esphome/esp-web-tools", "https://github.com/esphome/esp-web-tools"],
      ["Web Serial API", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API"],
    ],
    render: renderEspManifestPage,
    bind: bindEspManifestPage,
  },
  "esp-raw": {
    title: "ESP raw BIN flasher",
    eyebrow: "Hosted esptool-js",
    utility: "ESP BIN",
    transport: "Web Serial",
    kicker: "Raw BIN flashing for Espressif chips over ROM serial bootloader.",
    summary:
      "Connect, detect the chip, erase flash, and write one or more local BIN files at explicit offsets using esptool-js bundled into this site.",
    devices: [
      "ESP8266",
      "ESP32",
      "ESP32-S2",
      "ESP32-S3",
      "ESP32-C2",
      "ESP32-C3",
      "ESP32-C5",
      "ESP32-C6",
      "ESP32-C61",
      "ESP32-H2",
      "ESP32-P4",
    ],
    references: [
      ["NPM: esptool-js", "https://www.npmjs.com/package/esptool-js"],
      ["GitHub: espressif/esptool-js", "https://github.com/espressif/esptool-js"],
      ["Web Serial API", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API"],
    ],
    render: renderEspRawPage,
    bind: bindEspRawPage,
  },
  dfu: {
    title: "DFU / DfuSe flasher",
    eyebrow: "Hosted WebDFU",
    utility: "DFU",
    transport: "WebUSB",
    kicker: "USB DFU downloads for STM32-style and generic DFU bootloaders.",
    summary:
      "Pair a DFU-capable WebUSB device, choose an interface, set a start address for DfuSe devices, and write a local firmware image.",
    devices: ["STM32 DFU", "STM32F1", "STM32F4", "STM32H7", "GD32 DFU", "Particle boards", "CH32V", "CH55x"],
    references: [
      ["NPM: dfu", "https://www.npmjs.com/package/dfu"],
      ["GitHub: Flipper-Zero/webdfu", "https://github.com/Flipper-Zero/webdfu"],
      ["WebUSB API", "https://developer.mozilla.org/en-US/docs/Web/API/USB"],
      ["USB DFU 1.1 specification", "https://www.usb.org/document-library/device-firmware-upgrade-11-new-version-31-aug-2004"],
    ],
    render: renderDfuPage,
    bind: bindDfuPage,
  },
  uf2: {
    title: "UF2 bootloader assistant",
    eyebrow: "Hosted UF2 helper",
    utility: "UF2",
    transport: "File + Web Serial",
    kicker: "Local UF2 validation and 1200-baud bootloader reset.",
    summary:
      "Validate UF2 firmware structure in the browser and trigger the 1200-baud reset used by many boards before they mount as USB storage.",
    devices: ["Raspberry Pi Pico", "RP2040", "RP2350", "BBC micro:bit", "Adafruit SAMD21", "Adafruit SAMD51", "nRF52840"],
    references: [
      ["UF2 file format", "https://github.com/microsoft/uf2"],
      ["Web Serial API", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API"],
      ["Raspberry Pi Pico bootrom", "https://github.com/raspberrypi/pico-bootrom"],
    ],
    render: renderUf2Page,
    bind: bindUf2Page,
  },
  "serial-flasher": {
    title: "Generic serial flasher",
    eyebrow: "Hosted serial sender",
    utility: "Serial",
    transport: "Web Serial",
    kicker: "Raw file transfer for simple UART bootloader workflows.",
    summary:
      "Send a local firmware file over a selected serial port with configurable baud, chunk size, delay, and optional command prefix.",
    devices: ["ATmega32U4", "Arduino Uno", "Arduino Mega", "BL602", "BL616", "RTL8710", "Kendryte K210", "Maix boards", "Teensy"],
    references: [
      ["Web Serial API", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API"],
      ["SerialPort interface", "https://developer.mozilla.org/en-US/docs/Web/API/SerialPort"],
    ],
    render: renderGenericSerialPage,
    bind: bindGenericSerialPage,
  },
  "serial-terminal": {
    title: "Serial terminal",
    eyebrow: "Hosted terminal",
    utility: "Terminal",
    transport: "Web Serial",
    kicker: "Interactive logs, REPLs, AT commands, and smoke checks.",
    summary:
      "Open an interactive terminal backed by Web Serial. This site hosts the terminal UI, and serialterminal.com is linked as the standalone terminal property.",
    devices: ["Generic UART", "REPL", "Boot logs", "AT commands"],
    references: [
      ["NPM: @xterm/xterm", "https://www.npmjs.com/package/@xterm/xterm"],
      ["GitHub: xterm.js", "https://github.com/xtermjs/xterm.js"],
      ["Web Serial API", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API"],
      ["serialterminal.com", "https://serialterminal.com"],
    ],
    render: renderSerialTerminalPage,
    bind: bindSerialTerminalPage,
  },
};

const deviceTypes = [
  ["ESP8266", "esp-raw"],
  ["ESP32", "esp-raw"],
  ["ESP32-S2", "esp-raw"],
  ["ESP32-S3", "esp-raw"],
  ["ESP32-C2", "esp-raw"],
  ["ESP32-C3", "esp-raw"],
  ["ESP32-C5", "esp-raw"],
  ["ESP32-C6", "esp-raw"],
  ["ESP32-C61", "esp-raw"],
  ["ESP32-H2", "esp-raw"],
  ["ESP32-P4", "esp-raw"],
  ["ESP manifest", "esp-manifest"],
  ["Raspberry Pi Pico", "uf2"],
  ["RP2040", "uf2"],
  ["RP2350", "uf2"],
  ["BBC micro:bit", "uf2"],
  ["Adafruit SAMD21", "uf2"],
  ["Adafruit SAMD51", "uf2"],
  ["Seeed XIAO", "uf2"],
  ["Arduino Nano 33", "uf2"],
  ["STM32 DFU", "dfu"],
  ["STM32F1", "dfu"],
  ["STM32F4", "dfu"],
  ["STM32H7", "dfu"],
  ["GD32 DFU", "dfu"],
  ["nRF52832", "uf2"],
  ["nRF52840", "uf2"],
  ["Particle boards", "dfu"],
  ["ATmega32U4", "serial-flasher"],
  ["Arduino Uno", "serial-flasher"],
  ["Arduino Mega", "serial-flasher"],
  ["CH32V", "dfu"],
  ["CH55x", "dfu"],
  ["BL602", "serial-flasher"],
  ["BL616", "serial-flasher"],
  ["RTL8710", "serial-flasher"],
  ["Kendryte K210", "serial-flasher"],
  ["Maix boards", "serial-flasher"],
  ["Teensy", "serial-flasher"],
  ["Generic UART", "serial-terminal"],
];

const supportRows = [
  ["Secure context", () => window.isSecureContext, "HTTPS or localhost"],
  ["Web Serial", () => "serial" in navigator, "ESP, UART, bootloader reset"],
  ["WebUSB", () => "usb" in navigator, "DFU and descriptor access"],
];

const app = document.querySelector("#app");
let serialTerminal;
let serialState = null;
let espState = null;
let dfuState = null;

window.addEventListener("hashchange", renderRoute);
renderRoute();

function currentRoute() {
  const hash = window.location.hash || "#/";
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "flasher" && flashers[parts[1]]) return { name: "flasher", id: parts[1] };
  return { name: "home" };
}

function renderRoute() {
  serialTerminal = null;
  const route = currentRoute();
  app.innerHTML = `
    <div class="app-shell">
      ${renderSidebar(route)}
      <main>${route.name === "flasher" ? renderFlasherPage(route.id) : renderHomePage()}</main>
    </div>
  `;

  if (route.name === "flasher") {
    flashers[route.id].bind();
  }
}

function renderSidebar(route) {
  const visibleDevices =
    route.name === "flasher" ? deviceTypes.filter(([, target]) => target === route.id) : deviceTypes;
  const deviceTitle = route.name === "flasher" ? "Supported by this flasher" : "Supported device types";

  return `
    <aside class="device-rail">
      <a class="brand" href="#/" aria-label="flasher.cloud home">
        <img src="${logoUrl}" alt="" />
        <span>flasher.cloud</span>
      </a>
      <nav class="utility-nav" aria-label="Flasher pages">
        ${Object.entries(flashers)
          .map(
            ([id, flasher]) => `
              <a class="${route.id === id ? "active" : ""}" href="#/flasher/${id}">
                <span>${flasher.title}</span>
                <small>${flasher.transport}</small>
              </a>
            `,
          )
          .join("")}
      </nav>
      <div class="rail-title">${deviceTitle}</div>
      <nav class="device-list" aria-label="Supported device types">
        ${visibleDevices
          .map(
            ([label, target]) => `
              <a href="#/flasher/${target}">
                <span>${label}</span>
                <small>${flashers[target].utility}</small>
              </a>
            `,
          )
          .join("")}
      </nav>
    </aside>
  `;
}

function renderHomePage() {
  return `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Hosted WebSerial and WebUSB flashing utilities</p>
        <h1>Flash microcontrollers from the browser.</h1>
        <p class="lede">
          flasher.cloud is a single workbench for firmware installs, raw binary flashing, DFU downloads,
          UF2 bootloader preparation, and serial diagnostics. Each flasher has its own page and runs on this site.
        </p>
        <div class="hero-actions">
          <a class="button primary" href="#/flasher/esp-raw">Start flashing</a>
          <a class="button secondary" href="#flasher-tiles">View flashers</a>
        </div>
      </div>
      <img class="hero-logo" src="${logoUrl}" alt="flasher.cloud logo" />
    </section>

    <section class="status-strip" aria-label="Browser capability status">
      ${supportRows.map(([name, test, note]) => statusCard(name, test(), note)).join("")}
    </section>

    <section id="flasher-tiles" class="section">
      <div class="section-heading">
        <p class="eyebrow">Flasher pages</p>
        <h2>Pick a hosted utility</h2>
        <p class="body-copy">
          The interface stays consistent across pages: device context, controls, progress, log output, and references.
        </p>
      </div>
      <div class="tile-grid">
        ${Object.entries(flashers).map(([id, flasher]) => tileCard(id, flasher)).join("")}
      </div>
    </section>
  `;
}

function renderFlasherPage(id) {
  const flasher = flashers[id];
  return `
    <section class="flasher-page">
      <header class="page-header">
        <p class="eyebrow">${flasher.eyebrow}</p>
        <h1>${flasher.title}</h1>
        <p class="lede">${flasher.kicker}</p>
      </header>

      <section class="status-strip compact" aria-label="Browser capability status">
        ${supportRows.map(([name, test, note]) => statusCard(name, test(), note)).join("")}
      </section>

      <div class="flasher-layout">
        <aside class="page-info">
          <section class="info-block">
            <h2>What it does</h2>
            <p>${flasher.summary}</p>
          </section>
          <section class="info-block">
            <h2>Device types</h2>
            <div class="chip-list">${flasher.devices.map((device) => `<span>${device}</span>`).join("")}</div>
          </section>
          <section class="info-block">
            <h2>References</h2>
            <ul class="reference-list">
              ${flasher.references.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join("")}
            </ul>
          </section>
        </aside>
        <section class="panel flasher-panel" aria-label="${flasher.title}">
          ${flasher.render()}
        </section>
      </div>
    </section>
  `;
}

function tileCard(id, flasher) {
  return `
    <a class="family-tile" href="#/flasher/${id}">
      <span>${flasher.transport}</span>
      <h3>${flasher.title}</h3>
      <p>${flasher.kicker}</p>
    </a>
  `;
}

function statusCard(name, ready, note) {
  return `
    <article class="status-card ${ready ? "ok" : "blocked"}">
      <span class="status-dot"></span>
      <div>
        <h3>${name}</h3>
        <p>${ready ? "Ready" : "Unavailable"}</p>
        <small>${note}</small>
      </div>
    </article>
  `;
}

function renderEspManifestPage() {
  return `
    <label for="manifest-url">Manifest path or URL</label>
    <div class="input-row">
      <input id="manifest-url" type="url" value="/firmware/manifest.json" autocomplete="off" />
      <button id="render-installer" class="button secondary">Render</button>
    </div>
    <div id="installer-host" class="installer-host">No installer rendered yet.</div>
  `;
}

function renderEspRawPage() {
  return `
    <div class="toolbar">
      <label for="esp-baud">Baud</label>
      <select id="esp-baud">
        <option>115200</option>
        <option>230400</option>
        <option selected>460800</option>
        <option>921600</option>
      </select>
      <button id="esp-connect" class="button primary">Connect ESP</button>
      <button id="esp-erase" class="button secondary" disabled>Erase flash</button>
    </div>
    <div id="esp-files" class="file-stack">
      ${espFileRow("0x1000")}
    </div>
    <div class="toolbar">
      <button id="esp-add-file" class="button secondary">Add file</button>
      <label class="check">
        <input id="esp-erase-all" type="checkbox" />
        Erase before write
      </label>
      <button id="esp-flash" class="button primary" disabled>Flash ESP</button>
    </div>
    <progress id="esp-progress" value="0" max="100"></progress>
    <pre id="esp-log" class="log-box">ESP flasher log.</pre>
  `;
}

function renderDfuPage() {
  return `
    <div class="toolbar">
      <button id="dfu-connect" class="button primary">Pair DFU device</button>
      <select id="dfu-interface" disabled></select>
      <button id="dfu-open" class="button secondary" disabled>Open interface</button>
    </div>
    <div class="input-row">
      <label class="file-picker">
        Firmware
        <input id="dfu-file" type="file" accept=".bin,.dfu,.hex,application/octet-stream" />
      </label>
      <label>
        Start address
        <input id="dfu-address" type="text" value="0x08000000" />
      </label>
      <button id="dfu-write" class="button primary" disabled>Write DFU</button>
    </div>
    <progress id="dfu-progress" value="0" max="100"></progress>
    <pre id="dfu-log" class="log-box">DFU log.</pre>
  `;
}

function renderUf2Page() {
  return `
    <div class="input-row">
      <label class="file-picker">
        UF2 file
        <input id="uf2-file" type="file" accept=".uf2" />
      </label>
      <button id="uf2-validate" class="button secondary">Validate UF2</button>
      <button id="uf2-reset" class="button primary">1200-baud reset</button>
    </div>
    <dl id="uf2-details" class="device-details">
      <div><dt>Status</dt><dd>No UF2 file selected.</dd></div>
    </dl>
  `;
}

function renderGenericSerialPage() {
  return `
    <div class="input-row">
      <label>
        Baud
        <select id="generic-baud">
          <option>9600</option>
          <option>57600</option>
          <option selected>115200</option>
          <option>230400</option>
          <option>460800</option>
          <option>921600</option>
        </select>
      </label>
      <label>
        Chunk bytes
        <input id="generic-chunk" type="number" min="16" max="4096" value="256" />
      </label>
      <label>
        Delay ms
        <input id="generic-delay" type="number" min="0" max="1000" value="8" />
      </label>
    </div>
    <div class="input-row">
      <label class="file-picker">
        Firmware
        <input id="generic-file" type="file" />
      </label>
      <input id="generic-prefix" type="text" placeholder="Optional command before transfer" />
      <button id="generic-send" class="button primary">Send over serial</button>
    </div>
    <progress id="generic-progress" value="0" max="100"></progress>
    <pre id="generic-log" class="log-box">Serial sender log.</pre>
  `;
}

function renderSerialTerminalPage() {
  return `
    <div class="toolbar">
      <label for="terminal-baud">Baud</label>
      <select id="terminal-baud">
        <option>9600</option>
        <option>57600</option>
        <option selected>115200</option>
        <option>230400</option>
        <option>460800</option>
        <option>921600</option>
      </select>
      <button id="terminal-connect" class="button primary">Connect</button>
      <button id="terminal-disconnect" class="button secondary" disabled>Disconnect</button>
      <a class="button ghost" href="https://serialterminal.com">serialterminal.com</a>
    </div>
    <div id="terminal" class="terminal-host"></div>
  `;
}

function espFileRow(offset) {
  return `
    <div class="esp-file-row">
      <label>
        Offset
        <input class="esp-offset" type="text" value="${offset}" />
      </label>
      <label class="file-picker">
        BIN file
        <input class="esp-file" type="file" accept=".bin,application/octet-stream" />
      </label>
    </div>
  `;
}

function bindEspManifestPage() {
  document.querySelector("#render-installer").addEventListener("click", renderEspInstaller);
}

function bindEspRawPage() {
  document.querySelector("#esp-add-file").addEventListener("click", addEspFileRow);
  document.querySelector("#esp-connect").addEventListener("click", connectEsp);
  document.querySelector("#esp-erase").addEventListener("click", eraseEsp);
  document.querySelector("#esp-flash").addEventListener("click", flashEsp);
}

function bindDfuPage() {
  document.querySelector("#dfu-connect").addEventListener("click", connectDfu);
  document.querySelector("#dfu-open").addEventListener("click", openDfuInterface);
  document.querySelector("#dfu-write").addEventListener("click", writeDfu);
}

function bindUf2Page() {
  document.querySelector("#uf2-validate").addEventListener("click", validateUf2);
  document.querySelector("#uf2-reset").addEventListener("click", uf2BootReset);
}

function bindGenericSerialPage() {
  document.querySelector("#generic-send").addEventListener("click", sendGenericSerial);
}

function bindSerialTerminalPage() {
  initTerminal();
  document.querySelector("#terminal-connect").addEventListener("click", connectTerminal);
  document.querySelector("#terminal-disconnect").addEventListener("click", disconnectTerminal);
}

function initTerminal() {
  const host = document.querySelector("#terminal");
  if (!host) return;
  serialTerminal = new Terminal({
    cursorBlink: true,
    convertEol: true,
    fontFamily: "JetBrains Mono, Menlo, Consolas, monospace",
    fontSize: 13,
    theme: {
      background: "#020507",
      foreground: "#d9ffe8",
      cursor: "#24d5ee",
      selectionBackground: "#1f4c57",
    },
  });
  serialTerminal.open(host);
  serialTerminal.write("Serial terminal ready.\r\n");
  serialTerminal.onData((data) => {
    if (!serialState?.writer) return;
    serialState.writer.write(new TextEncoder().encode(data));
  });
}

function assertSerialSupport() {
  if (!window.isSecureContext || !("serial" in navigator)) {
    throw new Error("Web Serial requires Chrome or Edge on HTTPS or localhost.");
  }
}

function assertUsbSupport() {
  if (!window.isSecureContext || !("usb" in navigator)) {
    throw new Error("WebUSB requires a compatible browser on HTTPS or localhost.");
  }
}

function parseAddress(value) {
  const cleaned = value.trim().toLowerCase();
  const parsed = cleaned.startsWith("0x") ? Number.parseInt(cleaned, 16) : Number.parseInt(cleaned, 10);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid address: ${value}`);
  return parsed;
}

function logTo(id, message) {
  const node = document.querySelector(id);
  if (!node) return;
  node.textContent += `\n${message}`;
  node.scrollTop = node.scrollHeight;
}

function setProgress(id, done, total) {
  const node = document.querySelector(id);
  if (!node) return;
  node.value = total ? Math.round((done / total) * 100) : 0;
}

function renderEspInstaller() {
  const manifest = document.querySelector("#manifest-url").value.trim();
  const host = document.querySelector("#installer-host");
  host.innerHTML = "";
  const installer = document.createElement("esp-web-install-button");
  installer.setAttribute("manifest", manifest);
  installer.setAttribute("show-log", "");
  installer.innerHTML = `
    <button slot="activate" class="button primary">Install firmware</button>
    <span slot="unsupported">Web Serial is unavailable in this browser.</span>
    <span slot="not-allowed">Use HTTPS or localhost for firmware installs.</span>
  `;
  host.append(installer);
}

function addEspFileRow() {
  document.querySelector("#esp-files").insertAdjacentHTML("beforeend", espFileRow("0x10000"));
}

async function connectEsp() {
  try {
    assertSerialSupport();
    const port = await navigator.serial.requestPort();
    const transport = new Transport(port, true);
    const terminal = {
      clean: () => {
        document.querySelector("#esp-log").textContent = "";
      },
      writeLine: (data) => logTo("#esp-log", data),
      write: (data) => {
        document.querySelector("#esp-log").textContent += data;
      },
    };
    const baudrate = Number(document.querySelector("#esp-baud").value);
    const loader = new ESPLoader({ transport, baudrate, terminal, debugLogging: false });
    const chipName = await loader.main("default_reset");
    espState = { loader, transport, chipName };
    document.querySelector("#esp-flash").disabled = false;
    document.querySelector("#esp-erase").disabled = false;
    logTo("#esp-log", `Connected: ${chipName}`);
  } catch (error) {
    logTo("#esp-log", `Connect failed: ${error.message}`);
  }
}

async function eraseEsp() {
  if (!espState) return;
  try {
    logTo("#esp-log", "Erasing flash...");
    await espState.loader.eraseFlash();
    logTo("#esp-log", "Erase complete.");
  } catch (error) {
    logTo("#esp-log", `Erase failed: ${error.message}`);
  }
}

async function flashEsp() {
  if (!espState) return;
  try {
    const fileArray = [];
    for (const row of document.querySelectorAll(".esp-file-row")) {
      const file = row.querySelector(".esp-file").files[0];
      if (!file) continue;
      const address = parseAddress(row.querySelector(".esp-offset").value);
      fileArray.push({ address, data: new Uint8Array(await file.arrayBuffer()) });
    }
    if (!fileArray.length) throw new Error("Choose at least one BIN file.");

    await espState.loader.writeFlash({
      fileArray,
      flashMode: "dio",
      flashFreq: "40m",
      flashSize: "keep",
      eraseAll: document.querySelector("#esp-erase-all").checked,
      compress: true,
      reportProgress: (_fileIndex, written, total) => setProgress("#esp-progress", written, total),
    });
    await espState.loader.after("hard_reset");
    logTo("#esp-log", "Flash complete. Device reset requested.");
  } catch (error) {
    logTo("#esp-log", `Flash failed: ${error.message}`);
  }
}

async function connectDfu() {
  try {
    assertUsbSupport();
    const device = await navigator.usb.requestDevice({ filters: [] });
    const logger = {
      info: (msg) => logTo("#dfu-log", msg),
      warning: (msg) => logTo("#dfu-log", `Warning: ${msg}`),
      progress: (done, total) => setProgress("#dfu-progress", done, total),
    };
    const webdfu = new WebDFU(device, { forceInterfacesName: true }, logger);
    await webdfu.init();
    if (!webdfu.interfaces.length) throw new Error("The selected device has no DFU interfaces.");
    dfuState = { webdfu, device };
    const select = document.querySelector("#dfu-interface");
    select.innerHTML = webdfu.interfaces
      .map((item, index) => `<option value="${index}">${item.name || `Interface ${index}`}</option>`)
      .join("");
    select.disabled = false;
    document.querySelector("#dfu-open").disabled = false;
    logTo("#dfu-log", `Paired ${device.productName || "USB device"} with ${webdfu.interfaces.length} DFU interface(s).`);
  } catch (error) {
    logTo("#dfu-log", `Pairing failed: ${error.message}`);
  }
}

async function openDfuInterface() {
  if (!dfuState) return;
  try {
    const index = Number(document.querySelector("#dfu-interface").value);
    await dfuState.webdfu.connect(index);
    const props = dfuState.webdfu.properties;
    document.querySelector("#dfu-write").disabled = !props?.CanDownload;
    logTo("#dfu-log", `Opened interface ${index}. Transfer size ${props?.TransferSize || "unknown"} bytes.`);
  } catch (error) {
    logTo("#dfu-log", `Open failed: ${error.message}`);
  }
}

async function writeDfu() {
  if (!dfuState) return;
  try {
    const file = document.querySelector("#dfu-file").files[0];
    if (!file) throw new Error("Choose a firmware file.");
    const data = await file.arrayBuffer();
    const webdfu = dfuState.webdfu;
    const transferSize = webdfu.properties?.TransferSize || 1024;
    webdfu.dfuseStartAddress = parseAddress(document.querySelector("#dfu-address").value);

    await new Promise((resolve, reject) => {
      const process = webdfu.write(transferSize, data, webdfu.properties?.ManifestationTolerant !== false);
      process.events.on("erase/start", () => logTo("#dfu-log", "Erase started."));
      process.events.on("erase/process", (done, total) => setProgress("#dfu-progress", done, total));
      process.events.on("write/start", () => logTo("#dfu-log", "Write started."));
      process.events.on("write/process", (done, total) => setProgress("#dfu-progress", done, total));
      process.events.on("error", reject);
      process.events.on("end", resolve);
    });
    logTo("#dfu-log", "DFU write complete.");
  } catch (error) {
    logTo("#dfu-log", `DFU write failed: ${error.message || error}`);
  }
}

async function validateUf2() {
  const file = document.querySelector("#uf2-file").files[0];
  const details = document.querySelector("#uf2-details");
  if (!file) {
    details.innerHTML = "<div><dt>Status</dt><dd>No UF2 file selected.</dd></div>";
    return;
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const blockSize = 512;
  const blocks = Math.floor(bytes.length / blockSize);
  let valid = bytes.length > 0 && bytes.length % blockSize === 0;
  let family = "Not present";
  let payloadBytes = 0;
  if (valid) {
    const view = new DataView(bytes.buffer);
    for (let offset = 0; offset < bytes.length; offset += blockSize) {
      if (view.getUint32(offset, true) !== 0x0a324655 || view.getUint32(offset + 4, true) !== 0x9e5d5157) {
        valid = false;
        break;
      }
      payloadBytes += view.getUint32(offset + 16, true);
      const flags = view.getUint32(offset + 8, true);
      if (flags & 0x00002000) family = `0x${view.getUint32(offset + 28, true).toString(16).padStart(8, "0")}`;
    }
  }
  details.innerHTML = `
    <div><dt>Status</dt><dd>${valid ? "Valid UF2 structure" : "Invalid UF2 file"}</dd></div>
    <div><dt>Blocks</dt><dd>${blocks}</dd></div>
    <div><dt>Payload</dt><dd>${payloadBytes.toLocaleString()} bytes</dd></div>
    <div><dt>Family ID</dt><dd>${family}</dd></div>
  `;
}

async function uf2BootReset() {
  try {
    assertSerialSupport();
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 1200 });
    await port.close();
    document.querySelector("#uf2-details").innerHTML +=
      "<div><dt>Reset</dt><dd>1200-baud touch complete. The board may remount as a UF2 drive.</dd></div>";
  } catch (error) {
    document.querySelector("#uf2-details").innerHTML += `<div><dt>Reset</dt><dd>${error.message}</dd></div>`;
  }
}

async function sendGenericSerial() {
  try {
    assertSerialSupport();
    const file = document.querySelector("#generic-file").files[0];
    if (!file) throw new Error("Choose a firmware file.");
    const port = await navigator.serial.requestPort();
    const baudRate = Number(document.querySelector("#generic-baud").value);
    const chunkSize = Number(document.querySelector("#generic-chunk").value);
    const delay = Number(document.querySelector("#generic-delay").value);
    const prefix = document.querySelector("#generic-prefix").value;
    const bytes = new Uint8Array(await file.arrayBuffer());
    await port.open({ baudRate });
    const writer = port.writable.getWriter();
    if (prefix) await writer.write(new TextEncoder().encode(`${prefix}\r\n`));
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      await writer.write(bytes.slice(offset, offset + chunkSize));
      setProgress("#generic-progress", Math.min(offset + chunkSize, bytes.length), bytes.length);
      if (delay) await new Promise((resolve) => window.setTimeout(resolve, delay));
    }
    writer.releaseLock();
    await port.close();
    logTo("#generic-log", `Sent ${bytes.length.toLocaleString()} bytes at ${baudRate} baud.`);
  } catch (error) {
    logTo("#generic-log", `Send failed: ${error.message}`);
  }
}

async function connectTerminal() {
  try {
    assertSerialSupport();
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: Number(document.querySelector("#terminal-baud").value) });
    const writer = port.writable.getWriter();
    serialState = { port, writer, keepReading: true };
    document.querySelector("#terminal-connect").disabled = true;
    document.querySelector("#terminal-disconnect").disabled = false;
    serialTerminal.write("Connected.\r\n");
    readTerminalLoop(port);
  } catch (error) {
    serialTerminal.write(`Connect failed: ${error.message}\r\n`);
  }
}

async function readTerminalLoop(port) {
  const decoder = new TextDecoder();
  while (serialState?.keepReading && port.readable) {
    const reader = port.readable.getReader();
    serialState.reader = reader;
    try {
      while (serialState?.keepReading) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) serialTerminal.write(decoder.decode(value));
      }
    } catch (error) {
      serialTerminal.write(`Read stopped: ${error.message}\r\n`);
    } finally {
      reader.releaseLock();
    }
  }
}

async function disconnectTerminal() {
  if (!serialState) return;
  try {
    serialState.keepReading = false;
    await serialState.reader?.cancel();
    serialState.writer?.releaseLock();
    await serialState.port.close();
    serialTerminal.write("Disconnected.\r\n");
  } catch (error) {
    serialTerminal.write(`Disconnect failed: ${error.message}\r\n`);
  } finally {
    serialState = null;
    document.querySelector("#terminal-connect").disabled = false;
    document.querySelector("#terminal-disconnect").disabled = true;
  }
}
