// ABOUTME: Renders one JSON-LD script tag with a serialisation that cannot break out of the script element.
// ABOUTME: The only place in app/ that writes application/ld+json; escapes <, >, & and U+2028/2029.

const ESCAPES = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

// JSON.stringify leaves "<" alone, so a title containing "</script>" would end
// the element early. Each escape is still valid JSON for the same character.
export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => ESCAPES[c]);
}

export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
