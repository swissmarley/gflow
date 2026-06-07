import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__row">
        <a className="brand" href="#home" aria-label="gflow home">
          <BrandMark className="brand-mark" />
          <span>gflow</span>
        </a>
        <p>Open-source creative tooling by swissmarley.</p>
        <p>{new Date().getFullYear()}</p>
      </div>
      <p className="site-disclaimer">
        gflow is an unofficial, personal project with no commercial purpose. It
        is not affiliated with, endorsed by, or sponsored by Google. It only
        automates your own Google Flow session through your own browser — you
        remain responsible for complying with Google&rsquo;s Terms of Service.
      </p>
    </footer>
  );
}
