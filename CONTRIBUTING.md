# Contributing to HueForge

Thanks for helping make HueForge better. Everyone is welcome to contribute, from first-time contributors to experienced developers.

## Before you start

- **Small fixes** (typos, bugs, styling issues): open a pull request directly.
- **Larger changes** (new tools, new export formats, big refactors): open an issue first so we can agree on the approach before you spend time on it.
- **Check existing issues and pull requests** to avoid duplicating work.

## Ways to contribute

- Report a bug or a confusing behavior.
- Improve accessibility, mobile layouts or performance.
- Fix a color-math or contrast-calculation problem.
- Suggest or build a new tool, export format or preset.
- Improve documentation.

## Reporting bugs

Open an issue with:

1. What you expected and what happened.
2. Steps to reproduce, including the tool and the colors or settings used. A link from the app's share button is ideal.
3. Your browser, operating system and device.
4. A screenshot or screen recording if it is a visual problem.

## Development setup

You need Node.js 22.22.1 or later.

```bash
git clone https://github.com/Krexilor/HueForge.git
cd HueForge
npm install
npm run dev
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite dev server |
| `npm run build` | Creates a production build |
| `npm run preview` | Serves the production build locally |

There is no automated test suite or linter yet, so please test your changes manually (see [Pull requests](#pull-requests)).

## Project principles

Pull requests that break these are likely to be declined.

- **Privacy first.** HueForge collects no user data and runs entirely in the browser. Do not add analytics, tracking, remote logging, or any backend or API call that sends user input anywhere.
- **Accessibility matters.** Use semantic HTML, keep keyboard access working, keep focus styles visible, and keep text contrast sufficient in both themes.
- **Works on every screen.** Pages should work from 320px-wide phones up to large desktops.
- **Keep dependencies minimal.** Open an issue before adding a new package.

## Code style

There is no formatter configured, so please match the surrounding code:

- 4-space indentation, and spaces around `=` in JSX props (`className = {styles.card}`).
- Components and page folders use PascalCase. Hooks are camelCase files starting with `use`. Files in `lib/` use PascalCase.
- Each component has its own folder with a `.jsx` file and a CSS Module (`Name.module.css`).
- Files are organized with banner comments (`// LIBRARIES ---|`, `// COMPONENTS ---|`, `// HELPERS ---|`, `// STYLES ---|`, `// CONSTANTS ---|`), and CSS uses matching `/* SECTION --- */` banners.
- Use the existing CSS variables (`--space-*`, `--radius-*`, `--accent` and so on) instead of hard-coded values where one exists.
- Keep color logic in `lib/Color`, export logic in `lib/Export`, and shared state in `hooks/`. Don't duplicate it inside pages.
- Add comments only where they explain something that is not obvious.

## Responsive design

Every page and component should work on phones and tablets. When you add or change UI:

- Make the page's root element a container (`container-type: inline-size`) and use `@container` queries for layout, so it adapts to the space left after the sidebar.
- Keep interactive elements at least 44px tall on touch devices (`@media (pointer: coarse)`).
- Wrap hover-only effects in `@media (hover: hover)`, and provide an `:active` state for touch.
- Set text inputs to `font-size: 16px` so iOS Safari doesn't zoom on focus.
- Give grid and flex children `min-width: 0` (or a `minmax(0, 1fr)` track) so inputs and long text can shrink instead of overflowing.
- Respect `prefers-reduced-motion`.
- Check your change at about 320px, 375px, 768px and a desktop width, in light and dark themes where relevant.

## Common contributions

**Adding a new tool**

1. Create a folder in `src/pages/` with the page component and its CSS Module.
2. Register it in `src/data/Pages.data.js` (path, label, description, icon). The Overview page and sidebar read from this list.
3. Add its route in `App.jsx`.
4. Reuse shared components from `components/common` and shared state from `hooks/` where possible.

**Adding an export format**

1. Add the format to the relevant file in `src/lib/Export/` (for example `Tokens.js` for palettes and `ThemeExport.js` for themes).
2. `ExportPanel` renders whatever formats a page passes it, so the new tab appears automatically.

## Pull requests

1. Fork the repository and create a branch from `main` with a short descriptive name.
2. Keep each pull request focused on one thing.
3. Run `npm run build` and confirm there are no errors.
4. Test manually on a desktop and a mobile-sized viewport, and in light and dark themes if your change touches color or theming.
5. Open the pull request and describe what changed and why. Add before and after screenshots for visual changes, and link the related issue.

A maintainer will review it and may ask for changes. Please be patient, as this project is maintained in spare time.

## Third-party code

Only submit code you wrote or have the right to submit. Don't copy code from projects whose licenses are incompatible with this project's license (for example, GPL code). If you add a dependency or an asset, say where it comes from and under what license.

## Licensing of contributions

HueForge is distributed under the license in [LICENSE](LICENSE). By submitting a contribution you confirm that:

1. You wrote it, or you have the right to submit it.
2. It is licensed under the same terms as the rest of the project.
3. You grant the project maintainer a perpetual, worldwide, non-exclusive, royalty-free, irrevocable license to use, modify and sublicense your contribution under any terms, including commercial licenses the maintainer may offer.

If you are not comfortable with these terms, please do not submit a contribution.

## Code of conduct

Be respectful and constructive. Harassment, personal attacks and discrimination are not tolerated, and the maintainer may remove comments or block participants who break this rule.

## Security and privacy concerns

If you find a security or privacy problem, please report it privately to krexilor.dev@gmail.com instead of opening a public issue.
