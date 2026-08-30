import { SITE } from '../config';

export async function GET() {
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
}
