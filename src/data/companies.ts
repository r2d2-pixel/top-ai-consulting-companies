export type Company = {
  slug: string;
  name: string;
  website: string;
  tagline: string;
  description: string;
  founded: number;
  hq: string;
  teamSize: string;
  rating: number;
  badges: string[];
  bestFor: string;
  primaryDifferentiator: string;
  pricingModel: string;
  minimumEngagement: string;
  techStack: string[];
  industries: string[];
  engagementModels: string[];
  pros: string[];
  cons: string[];
  useCases: string[];
  featured: boolean;
};

// ─── ADD YOUR COMPANIES HERE ──────────────────────────────────────────────
// One Company object per entry. All pages (profile, alternatives, comparisons,
// home) regenerate automatically — no new route files needed.
//
// Rating logic:
//   - Ratings are editorial scores for niche suitability specifically
//   - No company should top every dimension — each should have real trade-offs
//   - The featured:true company is shown as Editor's pick #1
//   - Set featured:false on all others
//
// Verified facts to check before adding any company:
//   - Founding year (Crunchbase, LinkedIn, company about page)
//   - HQ city (primary source; note if legal HQ differs from delivery centre)
//   - Employee count (LinkedIn or Crunchbase)
//   - Acquisitions or ownership changes (must be disclosed in description + cons)
// ─────────────────────────────────────────────────────────────────────────────

export const companies: Company[] = [
  // TODO: Add your companies here. Example structure:
  // {
  //   slug: "example-company",
  //   name: "Example Company",
  //   website: "https://www.example.com",
  //   tagline: "Short positioning tagline",
  //   description: "2-4 sentence factual description with verified details only.",
  //   founded: 2015,
  //   hq: "City, Country",
  //   teamSize: "51–200",
  //   rating: 4.5,
  //   badges: ["Service 1", "Service 2", "Service 3"],
  //   bestFor: "Specific buyer type and use case",
  //   primaryDifferentiator: "One-line unique value proposition",
  //   pricingModel: "Fixed project, retainer",
  //   minimumEngagement: "$20K",
  //   techStack: ["Tool 1", "Tool 2", "Tool 3"],
  //   industries: ["Industry 1", "Industry 2"],
  //   engagementModels: ["Fixed project", "Retainer"],
  //   pros: ["Pro 1", "Pro 2", "Pro 3"],
  //   cons: ["Con 1", "Con 2"],
  //   useCases: ["Use case 1", "Use case 2"],
  //   featured: true,  // set true on your #1 company — it will be pinned first in the nav
  // },
];

export function getCompany(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}

export function getAllSlugs(): string[] {
  return companies.map((c) => c.slug);
}

export function getComparisons(): Array<{ slug1: string; slug2: string; slug: string }> {
  const pairs = [];
  for (let i = 0; i < companies.length; i++) {
    for (let j = i + 1; j < companies.length; j++) {
      pairs.push({
        slug1: companies[i].slug,
        slug2: companies[j].slug,
        slug: `${companies[i].slug}-vs-${companies[j].slug}`,
      });
    }
  }
  return pairs;
}
