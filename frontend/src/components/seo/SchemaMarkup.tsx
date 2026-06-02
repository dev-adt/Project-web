'use client';

interface SchemaMarkupProps {
  schema: any;
}

export default function SchemaMarkup({ schema }: SchemaMarkupProps) {
  if (!schema) return null;

  const jsonString = typeof schema === 'string' 
    ? schema 
    : JSON.stringify(schema, null, 2);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
