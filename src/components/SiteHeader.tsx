import { Github } from "lucide-react";
import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="gflow home">
        <BrandMark className="brand-mark" />
        <span>gflow</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#products">Products</a>
        <a href="#skills">Skills</a>
        <a href="#quality">Quality</a>
      </nav>
      <a
        className="github-link"
        href="https://github.com/swissmarley"
        target="_blank"
        rel="noreferrer"
        aria-label="Open swissmarley on GitHub"
      >
        <Github aria-hidden="true" />
      </a>
    </header>
  );
}
