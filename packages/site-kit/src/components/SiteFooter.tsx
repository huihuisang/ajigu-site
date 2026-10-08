import { StudioSignature } from "./StudioSignature";
import type { Link } from "../models";

export function SiteFooter({
  name = "ajigu",
  links,
  copyright,
  signatureLabel = "Say hello to ajigu",
}: {
  name?: string;
  links: Link[];
  copyright?: string;
  signatureLabel?: string;
}) {
  return (
    <footer className="site-footer">
      <div className="studio-shell footer-inner">
        <div className="footer-signature">
          <p>{copyright || `© 2026 ${name}`}</p>
          <StudioSignature label={signatureLabel} />
        </div>
        <div className="footer-links">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
