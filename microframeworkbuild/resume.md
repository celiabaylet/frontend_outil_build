L’objectif de cet exercice est de créer **un outil de build Node.js** capable de générer automatiquement le **code CSS du framework Plugo** à partir d’un fichier de configuration `plugo.config.js`.

🎨 Thème

✔️ Les couleurs dans theme.colors → déclinées automatiquement en clair/sombre
    → grâce à hexToHsl() + adjustLuminance() dans generateColorVariables().
    → Les teintes light et dark sont calculées automatiquement (+/-20%) → non configurables ✅
✔️ Si darkMode = true, tu génères un mode sombre global (prefers-color-scheme + .dark) ✅

🖋️ Typographie

✔️ typography.main → appliquée au body
✔️ typography.headlines → appliquée à h1–h6
✔️ spacing.ratioLineHeight bien utilisé pour le line-height ✅

📐 Layout

✔️ layout.container : injectée dans --container-width ✅
✔️ layout.cols : utilisée dans generateGrid() pour créer .col-1 à .col-12
✔️ layout.breakpoints : utilisé dans 
    generateGrid() → .md:col-6, etc.
    generateResponsiveUtilities() → .md:flex, .lg:mt-2, etc. ✅

📏 Spacing

✔️ baseUnit utilisée pour font-size et variable CSS
✔️ ratioLineHeight utilisée pour calculer line-height ✅

⚙️ Components & Utilities

✔️ mergeCssFiles() charge uniquement les fichiers présents dans config.components et config.utilities
✔️ Si un élément n’est pas listé → aucune inclusion → conforme ✅

🧾 Sortie attendue

✔️ Deux fichiers produits :
    dist/plugo.css → version lisible
    dist/plugo.min.css → minifiée via postcss([autoprefixer, cssnano]) ✅
✔️ Les préfixes CSS sont ajoutés par Autoprefixer ✅

💡 Technique

✔️ Node.js + fs, path, postcss, autoprefixer, cssnano
✔️ Import dynamique du plugo.config.js (ESM)
✔️ Structure modulaire claire (generateColorVariables, generateGrid, generateResponsiveUtilities, etc.) ✅

✅ Bonus

✔️ Rapport de build affiché en console :
    → nombre de classes (countClasses())
    → taille du fichier en Ko ✅