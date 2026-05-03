import { resolve } from "node:path";
import { defineConfig } from "vite";

const root = process.cwd();

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        styleOptions: resolve(root, "siteStyleOptions.html"),
        styleOptionCommand: resolve(root, "style-option-command.html"),
        styleOptionLab: resolve(root, "style-option-lab.html"),
        styleOptionTerminal: resolve(root, "style-option-terminal.html"),
        styleOptionIndustrial: resolve(root, "style-option-industrial.html"),
        styleOptionGlass: resolve(root, "style-option-glass.html"),
        styleOptionDocs: resolve(root, "style-option-docs.html"),
        styleOptionMobile: resolve(root, "style-option-mobile.html"),
        styleOptionCyber: resolve(root, "style-option-cyber.html"),
        styleOptionRetro: resolve(root, "style-option-retro.html"),
        styleOptionEditorial: resolve(root, "style-option-editorial.html"),
        styleOptionSchematic: resolve(root, "style-option-schematic.html"),
        styleOptionMission: resolve(root, "style-option-mission.html"),
        styleOptionWizard: resolve(root, "style-option-wizard.html"),
        styleOptionMatrix: resolve(root, "style-option-matrix.html"),
        styleOptionProduct: resolve(root, "style-option-product.html"),
        styleOptionSplit: resolve(root, "style-option-split.html"),
        styleOptionPro: resolve(root, "style-option-pro.html"),
      },
    },
  },
});
