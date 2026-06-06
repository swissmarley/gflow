import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { products } from "../content/siteContent";
import { PortalScene } from "./PortalScene";

export function ProductWorld() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      className="chapter product-world"
      id="products"
      ref={sectionRef}
      aria-labelledby="products-title"
    >
      <PortalScene
        kind="products"
        sectionRef={sectionRef}
        label="Connected gflow product worlds"
      />
      <header className="chapter-heading">
        <p>Two products. One creative system.</p>
        <h2 id="products-title">Control the engine. Carry the craft.</h2>
      </header>
      <div className="product-copy-grid">
        {products.map((product) => (
          <article
            className={`product-copy product-copy--${product.accent}`}
            key={product.id}
          >
            <span>{product.id}</span>
            <p className="product-label">{product.label}</p>
            <h3>{product.title}</h3>
            <p>{product.copy}</p>
            <code>{product.command}</code>
            <a href={product.href} target="_blank" rel="noreferrer">
              Open repository <ArrowUpRight aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
