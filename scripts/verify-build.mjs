import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.join(root, "dist");
const expectedPages = [
    "index.html",
    "404.html",
    "docs/index.html",
    "docs/getting-started/index.html",
    "docs/plaid/index.html",
    "docs/venmo/index.html",
    "docs/amazon-orders/index.html",
    "docs/openai/index.html",
];
const expectedImages = [
    "images/monthly-budget.webp",
    "images/transactions.webp",
    "images/reporting.webp",
];

function requireFile(relativePath) {
    const absolutePath = path.join(outputDirectory, relativePath);

    if (!fs.statSync(absolutePath, { throwIfNoEntry: false })?.isFile()) {
        throw new Error(`Missing build output: ${relativePath}`);
    }

    return absolutePath;
}

function resolveInternalTarget(value) {
    const pathname = value.split(/[?#]/u, 1)[0];

    if (!pathname || !pathname.startsWith("/")) {
        return null;
    }

    const relativePath = pathname.slice(1);

    if (!relativePath || pathname.endsWith("/")) {
        return path.join(relativePath, "index.html");
    }

    return relativePath;
}

for (const page of expectedPages) {
    const html = fs.readFileSync(requireFile(page), "utf8");

    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/gu)) {
        const target = resolveInternalTarget(match[1]);

        if (target) {
            requireFile(target);
        }
    }
}

for (const image of expectedImages) {
    const imagePath = requireFile(image);

    if (fs.statSync(imagePath).size < 20_000) {
        throw new Error(`Product screenshot appears incomplete: ${image}`);
    }
}

const homepage = fs.readFileSync(requireFile("index.html"), "utf8");

if (!homepage.includes("https://github.com/budgetedhq/budgeted")) {
    throw new Error("Homepage is missing the Budgeted GitHub repository link.");
}

console.log(`Verified ${expectedPages.length} pages and ${expectedImages.length} product screenshots.`);
