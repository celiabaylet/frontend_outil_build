// build.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import config from './plugo.config.js';

// __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1 Chemins
const cssPath = path.join(__dirname, 'css');
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) fs.mkdirSync(distPath);

// 2 HEX → HSL
function hexToHsl(hex) {
  hex = hex.replace('#', '');
  const bigint = parseInt(hex, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// 3 Ajuster la luminosité d'une couleur HSL
function adjustLuminance(hsl, delta) {
  let [h, s, l] = hsl;
  l = Math.min(100, Math.max(0, l + delta));
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// 4 Variables de couleur (fusionné dans un seul :root)
function generateColorVariables(colors) {
  let vars = '';
  for (const [name, hex] of Object.entries(colors)) {
    const hsl = hexToHsl(hex);
    const light = adjustLuminance(hsl, 20);
    const dark = adjustLuminance(hsl, -20);
    vars += `  --color-${name}: hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%);\n`;
    vars += `  --color-${name}-light: ${light};\n`;
    vars += `  --color-${name}-dark: ${dark};\n`;
  }
  return vars;
}

// 5 Typographie
function generateTypography(typography, spacing) {
  const { main, headlines } = typography;
  const ratio = parseFloat(spacing.ratioLineHeight) || 1.25;
  return `
body {
  font-family: ${main};
  font-size: ${spacing.baseUnit};
  line-height: calc(${spacing.baseUnit} * ${ratio});
}

h1,h2,h3,h4,h5,h6 {
  font-family: ${headlines};
  line-height: calc(${spacing.baseUnit} * ${ratio});
}
`;
}

// 6 Fusion fichiers CSS
function mergeCssFiles(folderPath, allowedFiles = []) {
  let combined = '';
  if (!fs.existsSync(folderPath)) return combined;
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    if (file.endsWith('.css')) {
      const name = path.basename(file, '.css').replace(/^_/, '');
      if (allowedFiles.length && !allowedFiles.includes(name)) continue;
      const content = fs.readFileSync(path.join(folderPath, file), 'utf8');
      combined += `\n/* ===== ${file} ===== */\n${content}\n`;
    }
  }
  return combined;
}

// 7 Grille responsive
function generateGrid(layout) {
  const { cols, breakpoints } = layout;
  let css = '\n/* === Grille responsive === */\n';
  for (const [key, width] of Object.entries(breakpoints)) {
    css += `@media (min-width: ${width}) {\n`;
    for (let i = 1; i <= cols; i++) {
      const pct = (i / cols) * 100;
      css += `  .${key}\\:col-${i} { width: ${pct}%; }\n`;
    }
    css += '}\n';
  }
  return css;
}

// 8 Utilities responsives (regex robuste)
function generateResponsiveUtilities(utilitiesCss, breakpoints) {
  let css = '\n/* === Utilities responsives === */\n';

  // Supprime les commentaires
  const cleanCss = utilitiesCss.replace(/\/\*[\s\S]*?\*\//g, '');

  // Capture uniquement les classes simples (pas de pseudo, ni de sélecteurs composés)
  const classRegex = /\.([A-Za-z0-9\-\_]+)\s*\{\s*([^}]+)\s*\}/g;
  let match;
  const generatedBase = new Set();

  while ((match = classRegex.exec(cleanCss)) !== null) {
    const className = match[1].trim();
    const rules = match[2].trim();

    // Ignore sélecteurs composés (ex .btn.is-primary, .grow-1:hover, .a,.b)
    if (/[ ,:\[\]]/.test(className)) continue;

    // Ajoute la classe de base une seule fois
    if (!generatedBase.has(className)) {
      css += `.${className} { ${rules} }\n`;
      generatedBase.add(className);
    }

    // Génère variantes responsives (.md\:flex, .lg\:mt-2, etc.)
    for (const [bp, width] of Object.entries(breakpoints)) {
      css += `@media (min-width: ${width}) {\n`;
      css += `  .${bp}\\:${className} { ${rules} }\n`;
      css += `}\n`;
    }
  }
  return css;
}

// 9 Construction du CSS principal (fusion unique du :root)
const colorVars = generateColorVariables(config.theme.colors);
let cssOutput = `/* ======================================
   PLUGO CSS BUILD
   Généré automatiquement le ${new Date().toLocaleString()}
====================================== */
:root {
  --container-width: ${config.theme.layout.container};
  --base-unit: ${config.theme.spacing.baseUnit};
  --transition-duration: ${config.theme.transition.duration};
  --transition-type: ${config.theme.transition.type};
${colorVars}}
`;

if (config.darkMode) {
  cssOutput += `
/* === Dark mode automatique === */
@media (prefers-color-scheme: dark) {
  body { background-color: #111; color: #fff; }
}
.dark { background-color: #111; color: #fff; }
`;
}

cssOutput += generateTypography(config.theme.typography, config.theme.spacing);
cssOutput += mergeCssFiles(path.join(cssPath, 'base'));
cssOutput += mergeCssFiles(path.join(cssPath, 'layout'));
cssOutput += mergeCssFiles(path.join(cssPath, 'components'), config.components);

// Utilities + responsives
const utilitiesCss = mergeCssFiles(path.join(cssPath, 'utilities'), config.utilities);
cssOutput += generateResponsiveUtilities(utilitiesCss, config.theme.layout.breakpoints);

// Grille responsive
cssOutput += generateGrid(config.theme.layout);

// 10 Écriture du fichier lisible
const cssFile = path.join(distPath, 'plugo.css');
fs.writeFileSync(cssFile, cssOutput, 'utf8');
console.log('✅ dist/plugo.css généré !');

// 11 Rapport rapide
function countClasses(cssText) {
  const matches = cssText.match(/\.[A-Za-z0-9\-\_\\\:]+/g);
  return matches ? new Set(matches).size : 0;
}
const classCount = countClasses(cssOutput);
const bytes = Buffer.byteLength(cssOutput, 'utf8');
console.log(`Build report — classes ≈ ${classCount}, taille ≈ ${(bytes / 1024).toFixed(2)} KB`);

// 12 Minification PostCSS
(async () => {
  try {
    const minified = await postcss([autoprefixer, cssnano]).process(cssOutput, { from: undefined });
    fs.writeFileSync(path.join(distPath, 'plugo.min.css'), minified.css);
    console.log('✅ dist/plugo.min.css généré avec PostCSS !');
  } catch (err) {
    console.error('❌ Erreur lors de la minification :', err);
  }
})();
