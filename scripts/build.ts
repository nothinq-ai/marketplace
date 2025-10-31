import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const build = async () => {
  const srcDir = resolve(process.cwd(), "src");
  const publicDir = resolve(process.cwd(), "public");
  const outputFile = join(publicDir, "index.json");

  // Ensure public directory exists
  mkdirSync(publicDir, { recursive: true });

  // Read all JSON files from src directory
  const files = readdirSync(srcDir).filter((file) => file.endsWith(".json"));

  const extensions: any[] = [];
  const allTags = new Set<string>();

  // Process each extension file
  for (const file of files) {
    const filePath = join(srcDir, file);
    const content = readFileSync(filePath, "utf-8");
    const extension = JSON.parse(content);

    extensions.push(extension);

    // Collect tags
    if (extension.meta?.tags) {
      extension.meta.tags.forEach((tag: string) => allTags.add(tag));
    }
  }

  // Sort extensions by identifier
  extensions.sort((a, b) => a.identifier.localeCompare(b.identifier));

  // Build the index
  const index = {
    name: "@nothing/marketplace",
    version: "1.0.0",
    extensions,
    tags: Array.from(allTags).sort(),
  };

  // Write to public/index.json
  writeFileSync(outputFile, JSON.stringify(index, null, 2));

  console.log(`✓ Built ${extensions.length} extensions to public/index.json`);
  console.log(`✓ Total tags: ${allTags.size}`);
};

await build();
