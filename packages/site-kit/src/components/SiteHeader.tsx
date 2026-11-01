import { useState } from "react";
import { ChevronDown, Languages } from "@ajigu/ui/icons";
import { Button } from "@ajigu/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@ajigu/ui/components/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@ajigu/ui/components/navigation-menu";
import type { LanguageLink } from "../models";
import type { StudioCopy } from "../copy";
import { explicitLanguageHref, saveLanguagePreference } from "../scripts/language";

interface Props {
  name: string;
  icon: string;
  route: string;
  home?: boolean;
  copy: StudioCopy;
  languages: LanguageLink[];
  language: string;
  onLanguageChange?: (code: string) => void;
  appId?: string;
  minimal?: boolean;
}
export function SiteHeader({ route, home, copy, languages, language, onLanguageChange }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const current = languages.find((entry) => entry.code === language) || languages[0];
  const links = home
    ? [
        { href: "#apps", label: copy.work },
        { href: "#contact", label: copy.contact },
      ]
    : [
        { href: "#features", label: copy.features },
        { href: "#faq", label: copy.faq },
      ];
  return (
    <header className="studio-header">
      <div className="studio-nav studio-shell">
        <a
          className="studio-brand brand"
          href={home ? route : "https://ajigu.com/"}
          aria-label="ajigu"
        >
          <img
            className="studio-brand-icon"
            src="/assets/logo.webp"
            alt=""
            width={36}
            height={36}
            decoding="async"
          />
          <span className="studio-brand-name">ajigu</span>
        </a>
        <NavigationMenu aria-label={copy.work} className="ml-auto">
          <NavigationMenuList>
            {links.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <a href={link.href}>{link.label}</a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Language" className="language-switcher">
              <span className="language-label">{current.label}</span>
              <Languages className="compact-language" aria-hidden="true" />
              <ChevronDown data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              {languages.map((entry) => (
                <DropdownMenuItem key={entry.code} asChild>
                  <a
                    href={explicitLanguageHref(entry.href, entry.code)}
                    data-language={entry.code}
                    data-lang={entry.code === "zht" ? "zh-Hant" : entry.code}
                    lang={entry.code === "zht" ? "zh-Hant" : entry.code}
                    aria-current={entry.code === language ? "page" : undefined}
                    onClick={(event) => {
                      saveLanguagePreference(entry.code);
                      if (onLanguageChange) {
                        event.preventDefault();
                        setMenuOpen(false);
                        onLanguageChange(entry.code);
                      }
                    }}
                  >
                    {entry.label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <noscript>
          <nav className="language-fallback" aria-label="Language">
            {languages.map((entry) => (
              <a
                key={entry.code}
                href={explicitLanguageHref(entry.href, entry.code)}
                lang={entry.code === "zht" ? "zh-Hant" : entry.code}
                aria-current={entry.code === language ? "page" : undefined}
              >
                {entry.label}
              </a>
            ))}
          </nav>
        </noscript>
      </div>
    </header>
  );
}
