/**
 * Resolve a public asset against Vite's configured base path so URLs work both
 * at the site root and under a GitHub Pages project subpath (e.g. /gflow/).
 */
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
