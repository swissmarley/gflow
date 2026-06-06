import { FinalInstall } from "./components/FinalInstall";
import { PortalHero } from "./components/PortalHero";
import { ProductWorld } from "./components/ProductWorld";
import { QualityGates } from "./components/QualityGates";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { SkillsCurrent } from "./components/SkillsCurrent";
import { InstallProvider } from "./install/InstallContext";

export default function App() {
  return (
    <InstallProvider>
      <SiteHeader />
      <main>
        <PortalHero />
        <ProductWorld />
        <SkillsCurrent />
        <QualityGates />
        <FinalInstall />
      </main>
      <SiteFooter />
    </InstallProvider>
  );
}
