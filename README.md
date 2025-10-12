# TéléSport – Olympic Dashboard

Front-end Angular application that presents historical Olympic Games statistics for the TéléSport project. The dashboard lets users explore medal counts per country and drill down into a country detail view showing performance over time.

## Prerequisites

- Node.js 18+ (check with `node -v`)
- npm 9+ (`npm -v`)

Install dependencies:

```bash
npm install
```

## Available Scripts

- `npm start` / `ng serve` – launches the dev server on `http://localhost:4200/` with live reload.
- `npm run build` – produces an optimized production build inside `dist/`.
- `npm test` – runs the unit test suite with Karma/Jasmine.

## Functional Overview

- **Dashboard (home route `/`)**
  - Summary cards showing the number of Olympic editions and participating countries represented in the dataset.
  - Interactive pie chart of cumulative medal counts per country; clicking a slice opens the corresponding detail page.
- **Country detail (`/country/:id`)**
  - Back button to return to the dashboard.
  - Metrics highlighting number of entries, total medals, and total athletes for the country.
  - Line chart depicting medals won across each participation year.

The layout is responsive to support desktop and mobile screens.

## Project Structure

- `src/app/core` – shared services (HTTP/data access) and business logic.
- `src/app/pages` – routed page components (dashboard and country detail pages).
- `src/app/shared/components` – reusable presentational widgets such as the pie and line charts.
- `src/assets/mock/olympic.json` – mock dataset served locally by `OlympicService`.

## Development Notes

- Data fetching is encapsulated in `OlympicService`, exposing RxJS observables. The starter loads the dataset on boot and shares it via a `BehaviorSubject`.
- Components consume observables with the `async` pipe to handle subscription cleanup automatically.
- All TypeScript interfaces are defined in `src/app/shared/models/olympic.model.ts` to keep the codebase strongly typed (no lingering `any`).
- Styling is authored in SCSS within each component for better encapsulation.

## Deployment

Run `npm run build` and serve the generated `dist/` directory with your preferred static host (e.g., GitHub Pages, Netlify, Vercel). The project uses relative asset paths and does not require server-side logic.

---

Feel free to fork or duplicate this repository, update the README with your deployment link, and share it with the TéléSport team once you are ready. Good luck for the final presentation! 
