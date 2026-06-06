import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="brand" href="#home" aria-label="gflow home">
        <BrandMark className="brand-mark" />
        <span>gflow</span>
      </a>
      <p>Open-source creative tooling by swissmarley.</p>
      <p>{new Date().getFullYear()}</p>
    </footer>
  );
}
