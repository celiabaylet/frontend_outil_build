# 🧩 Exercice : Créez l’outil de build du framework **Plugo**

L’objectif de cet exercice est de créer **un outil de build Node.js** capable de générer automatiquement le **code CSS du framework Plugo** à partir d’un fichier de configuration `plugo.config.js`.

---

## 🎯 Objectif

À partir du fichier suivant :

```js
const config = {
    darkMode: false,
    theme: {
        colors: {
            primary: '#6e52f7',
            success: '#78ffcb',
            warning: '#ffdb63',
            danger: '#ff5e78'
        },
        typography: {
            main: 'Arial, sans-serif',
            headlines: 'Verdana, sans-serif'
        },
        layout: {
            container: '900px',
            cols: 12,
            breakpoints: {
                sm: '500px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
            }
        },
        spacing: {
            baseUnit: '16px',
            ratioLineHeight: '1.25',
        },
        transition: {
            duration: '300ms',
            type: 'ease'
        }
    },
    components: ['button', 'card', 'alert'],
    utilities: ['flex', 'spacing', 'color', 'image']
}

export default config;
```

Vous devez construire un outil en Node.js capable de **générer automatiquement le code CSS complet** du framework.

---

## 🧱 Contraintes et règles

### 🎨 Thème

- Les **couleurs** définies dans `theme.colors` doivent être déclinées automatiquement en **version claire** et **version sombre** grâce à une fonction JS (par exemple, en ajustant la luminosité).
- Si `darkMode = true`, le build doit générer les variantes de couleurs en dark mode.
- Les teintes `light` et `dark` ne sont **pas configurables** : elles doivent être définies par défaut dans votre script.

### 🖋️ Typographie

- La propriété `typography.main` s’applique à tout le contenu général.
- La propriété `typography.headlines` s’applique uniquement aux balises de titre `<h1>` à `<h6>`.

### 📐 Layout

- `layout.container` : définit la largeur maximale des conteneurs.
- `layout.cols` : définit le **nombre de colonnes maximum** dans la grille responsive.
- `layout.breakpoints` : utilisé pour générer les **préfixes de classes responsives** de la grille et des classes utilitaires (ex. `.md:col-6`, `lg:mt`...).

### 📏 Spacing

- `spacing.baseUnit` sert d’unité de référence pour les espacements et marges.
- `spacing.ratioLineHeight` définit le ratio appliqué à la taille de la typographie pour les hauteurs de ligne (ex. `1.25` → `line-height: 125%`).

### ⚙️ Components & Utilities

- Les listes `components` et `utilities` indiquent **les fichiers CSS à inclure** dans le build.
- Si un élément n’est pas présent (ex. `card`), **aucun code CSS** lié à ce composant/utilitaire ne doit être généré.

---

## 🧾 Sortie attendue

L’outil doit produire deux fichiers :

- `plugo.css` → version lisible et commentée.
- `plugo.min.css` → version minifiée par `postcss` pour la production.

Le CSS généré doit être préfixé par `autoprefixer`.

---

## 💡 Indications techniques

- Utiliser **Node.js** avec le **module natif `fs`**.
- Le script de build peut être exécuté via la commande :
  ```bash
  npm run build
  ```
- Le fichier de configuration `plugo.config.js` devra être importé et interprété dynamiquement.
- Structure libre, mais votre code doit être **modulaire** (ex. une fonction `generateColors()`, une `generateGrid()`, etc.).

---

## ✅ Bonus

Générer un **rapport de build** (ex. nombre de classes produites, taille du fichier final).
