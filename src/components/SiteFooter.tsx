export function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="brand" href="#home" aria-label="gflow home">
        <span className="brand-sigil" aria-hidden="true" />
        <span>gflow</span>
      </a>
      <p>Open-source creative tooling by swissmarley.</p>
      <p>{new Date().getFullYear()}</p>
    </footer>
  );
}
