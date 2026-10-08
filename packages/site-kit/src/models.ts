export interface Link {
  href: string;
  label: string;
  external?: boolean;
}

export interface LanguageLink extends Link {
  code: string;
}

export interface Metadata {
  title: string;
  meta: Record<string, string | undefined>[];
  links: Record<string, string | undefined>[];
  structuredData: Record<string, unknown>[];
}

export interface Question {
  question: string;
  answer: string;
}
export interface Feature {
  title: string;
  body: string;
}
export interface Product {
  id: string;
  name: string;
  url: string;
  art: string;
  icon: string;
  platform: string;
}

export interface ProductPage {
  route: string;
  locale: string;
  metadata: Metadata;
  languages: LanguageLink[];
  heading: string;
  claim: string;
  intro: string;
  actions: Link[];
  note: string;
  sections: EditorialSection[];
  footerLinks: Link[];
  mainId: string;
  showcaseTitle?: string;
  footerText?: string;
}

export interface ProductIdentity {
  id: string;
  name: string;
  icon: string;
  art: string;
}

export interface EditorialSection {
  tags?: string[];
  id: string;
  title: string;
  body?: string;
  items?: { title: string; body: string }[];
  links?: Link[];
  questions?: Question[];
}
