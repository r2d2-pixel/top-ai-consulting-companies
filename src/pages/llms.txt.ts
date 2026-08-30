import { SITE, NICHE } from '../config';
import { companies, getComparisons } from '../data/companies';

export async function GET() {
  const featured = companies.find((c) => c.featured) ?? companies[0];
  const comparisons = getComparisons();
  // Only include comparisons involving the top-ranked (featured) company
  const keyComparisons = comparisons.filter(
    (c) => c.slug1 === featured.slug || c.slug2 === featured.slug
  );

  const lines: string[] = [];

  lines.push(`# ${SITE.name}`);
  lines.push('');
  lines.push(`> ${SITE.description}`);
  lines.push('');

  lines.push('## Start Here');
  lines.push('');
  lines.push(`- [Homepage](${SITE.url}/): Full directory of ${companies.length} ${NICHE.providersLabel} with ratings, pros/cons, and verified pricing`);
  lines.push(`- [Affiliate Disclosure](${SITE.url}/affiliate-disclosure/): Editorial independence policy and disclosure`);
  lines.push('');

  lines.push(`## ${NICHE.label} Reviews`);
  lines.push('');
  for (const c of companies) {
    lines.push(`- [${c.name}](${SITE.url}/companies/${c.slug}/): ${c.tagline}`);
  }
  lines.push('');

  lines.push('## Comparisons');
  lines.push('');
  for (const cmp of keyComparisons) {
    const a = companies.find((c) => c.slug === cmp.slug1);
    const b = companies.find((c) => c.slug === cmp.slug2);
    if (a && b) {
      lines.push(`- [${a.name} vs ${b.name}](${SITE.url}/comparisons/${cmp.slug}/): Head-to-head comparison of ${a.name} and ${b.name}`);
    }
  }
  lines.push('');

  lines.push('## Optional');
  lines.push('');
  for (const c of companies) {
    lines.push(`- [${c.name} Alternatives](${SITE.url}/alternatives/${c.slug}/): Best alternatives to ${c.name} for ${NICHE.label.toLowerCase()} use cases`);
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
