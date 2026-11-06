// Renders schema.org JSON-LD (see ./jsonld.ts). A data block, not a script, so the CSP does not apply.
import { serialise } from './jsonld';

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(data) }} />;
}
