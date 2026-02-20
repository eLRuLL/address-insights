# Address Insights

Explore location insights for any address: walkability, driving accessibility, transit access, close amenities, and urban/suburban classification.

**Live app:** [https://address-insights-three.vercel.app/](https://address-insights-three.vercel.app/)

---

## What I Built vs AI-Generated

**Personally built / owned:**

- Project setup and architecture decisions
- Feature requirements (walking score, driving score, transit score, urban/suburban index, search history, share via URL)
- Design choices (e.g. address in URL for sharing, Mapbox-only, localStorage for history)
- Token and security setup (client vs server tokens, scopes)
- Testing and deployment to Vercel
- Review and iteration on implementations
- Walking, driving (5-point sampling), and transit score logic using Mapbox Tilequery
- Urban/suburban classification from POI density
- Geocoding API route
- Search history with `useSearchHistory` hook and sidebar UI
- Share feature with address in URL

**AI-assisted implementation:**

- Mapbox map integration
- Walking radius circle and POI markers on the map
- Suspense boundaries and SSR-safe localStorage handling
- Automatic Readme generation

---

## Approach to Solving the Problem

1. **Start simple** – Single Mapbox map with geocoding, then add scores incrementally.
2. **Server-side for sensitive calls** – Geocoding and Tilequery run in an API route so tokens and keys stay on the server.
3. **Reuse data** – Walking POI data is reused for driving (center + 4 cardinal points) to reduce API calls.
4. **Work within limits** – Tilequery returns up to 50 features per request; driving score uses 5 overlapping circles to get a broader sample and deduplicate by feature ID.
5. **Keep history local** – Search history in `localStorage` to avoid backend storage and keep it device-specific.
6. **Share through the URL** – Address in query params (`?address=...`) so links can be shared and the same search loads when opened.

---

## Assumptions & Design Decisions

| Decision                       | Rationale                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------- |
| **Mapbox only**                | Single vendor for geocoding, Tilequery, and map tiles; no Overpass or other POIs. |
| **200m walking radius**        | Short walk; scores are tuned for that distance.                                   |
| **2km driving radius**         | Offset derived from `DRIVING_MAX_KM`; 5 circles at center + N/S/E/W for sampling. |
| **Address in URL for sharing** | No unique IDs or backend; links are self-contained and work without a database.   |
| **`localStorage` for history** | No auth or server storage; history stays on the device.                           |
| **Separate tokens**            | Public token for map display, server token for geocoding/Tilequery.               |
| **Urban = >10 POIs in 200m**   | Simple density rule for urban/suburban classification.                            |

---

## Tech Stack

- Next.js 16 (App Router)
- Mapbox GL JS & Geocoding API
- Tailwind CSS
- TypeScript
