# HTML Table Generator

A browser-based tool that turns plain data into ready-to-use HTML table code — either as a clean, unstyled table, or cloned into the exact structure, classes, and CSS of an existing table you provide.

🔗 **Live demo:** [table-code-generator.vercel.app](https://table-code-generator.vercel.app/)

---

## What it does

1. **Paste an example table (optional)** — the full HTML of an existing table, including any `<style>` block, wrapper `<div>`s, classes, and whether it uses `<thead>`/`<tbody>`, `<th>` or `<td>` for headers, etc.
2. **Paste your data** — first row as headers, then one row per line. Works with:
   - Tab-separated data (a table copy-pasted directly from Word, Excel, or Google Sheets)
   - Comma-separated data
   - Plain "one value per line" text (with a manual column-count field to remove any guesswork)
3. Click **Generate table** to get output HTML that:
   - Uses your data with **your example's exact tags, classes, and styling** — nothing added or removed that wasn't in the example
   - Falls back to a bare, unstyled `<table>` if no example is given
   - Adapts to any column count your data has, independent of the example's original column count
   - Preserves empty cells correctly, keeping columns aligned

## Features

- **Style-preserving generation** — clones example markup exactly (wrapper elements, classes, `<style>` blocks, `thead`/`tbody`, `th`/`td` usage) with no extra markup injected
- **Flexible data parsing** — auto-detects tabs or commas; manual column-count override for plain-text pastes
- **Rotate/transpose button** — swaps rows and columns when the pasted data's orientation is flipped
- **Live preview** alongside the raw output HTML, with one-click copy
- **Light/dark theme toggle** (saved to `localStorage`)
- **Custom cursor and particle trail effects**
- Fully responsive layout

## Tech stack

Plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step, no dependencies.

```
├── index.html   # structure/markup
├── style.css    # theming, layout, animations
└── script.js    # parsing logic, table generation, effects
```

## Running locally

Just clone and open `index.html` in a browser (or serve the folder with any static file server):

```bash
git clone https://github.com/Adityasharma3010/Table-Code-Generator.git
cd Table-Code-Generator
```

No build step or dependencies required.

## Deployment

Deployed on [Vercel](https://vercel.com/) as a static site.

## License

No license specified yet.
