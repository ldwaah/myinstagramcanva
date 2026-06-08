import fs from "fs";
import path from "path";

const TEMPLATE_REL = "templates/instagram-v1";

/** Resolve instagram-v1 template directory (monorepo root or apps/web copy). */
export function getTemplateRoot(): string {
  const candidates = [
    path.join(process.cwd(), "../../", TEMPLATE_REL),
    path.join(process.cwd(), TEMPLATE_REL),
    path.join(__dirname, "../../../../", TEMPLATE_REL),
    path.join(__dirname, "../../../", TEMPLATE_REL),
  ];

  for (const dir of candidates) {
    const cssPath = path.join(dir, "css/style.css");
    if (fs.existsSync(cssPath)) {
      return dir;
    }
  }

  throw new Error(
    `Template assets not found (looked for ${TEMPLATE_REL}/css/style.css). Ensure templates are included in the deployment bundle.`
  );
}

export async function readTemplateFile(relPath: string): Promise<string> {
  const filePath = path.join(getTemplateRoot(), relPath);
  const { readFile } = await import("fs/promises");
  return readFile(filePath, "utf8");
}
