// src/index.ts
var INFOBOX_FIELDS = [
  { key: "Razza", label: "Razza" },
  { key: "Classe", label: "Classe" },
  { key: "Background", label: "Background" },
  { key: "Allineamento", label: "Allineamento" },
  { key: "Et\xE0", label: "Et\xE0" },
  { key: "Altezza", label: "Altezza" },
  { key: "Peso", label: "Peso" },
  { key: "Livello", label: "Livello" }
];
function resolveWikilink(value) {
  if (value === null || value === void 0) return "";
  const str = String(value).trim();
  const imgMatch = str.match(/^\[\[([^\]|,]+\.(png|jpg|jpeg|gif|webp|svg))(?:[,|]\s*([^\]]*))?\]\]$/i);
  if (imgMatch) {
    const filename = imgMatch[1].trim();
    const alt = imgMatch[3]?.trim() ?? filename;
    return `<img src="${filename}" alt="${alt}" class="infobox-image" />`;
  }
  const linkMatch = str.match(/^\[\[([^\]|]+)(?:\|([^\]]*))?\]\]$/);
  if (linkMatch) {
    const target = linkMatch[1].trim();
    const label = linkMatch[2]?.trim() ?? target;
    const slug = target.toLowerCase().replace(/\s+/g, "-");
    return `<a href="/${slug}">${label}</a>`;
  }
  return str;
}
function cleanHtml(value) {
  if (value === null || value === void 0) return "";
  return String(value).replace(/<div>/gi, "").replace(/<\/div>/gi, "<br>").trim().replace(/<br>$/, "");
}
function buildInfobox(frontmatter, title) {
  console.log("DEBUG image field:", JSON.stringify(frontmatter["image"]));
  const rawImage = frontmatter["image"];
  let imageHtml = "";
  if (rawImage) {
    let filename = "";
    let alt = "";
    if (Array.isArray(rawImage) && Array.isArray(rawImage[0])) {
      filename = String(rawImage[0][0] ?? "").trim();
      alt = String(rawImage[0][1] ?? filename).trim();
    } else if (Array.isArray(rawImage)) {
      filename = String(rawImage[0] ?? "").trim();
      alt = filename;
    } else {
      const rendered = resolveWikilink(String(rawImage));
      if (rendered.startsWith("<img")) imageHtml = `<div class="infobox-image-container">${rendered}</div>`;
    }
    if (filename) {
      const imagePath = filename.includes("/") ? filename : `/images/${filename}`;
      imageHtml = `<div class="infobox-image-container"><img src="${imagePath}" alt="${alt}" class="infobox-image" /></div>`;
    }
  }
  const rows = INFOBOX_FIELDS.filter(({ key }) => frontmatter[key] !== void 0 && frontmatter[key] !== null && frontmatter[key] !== "").map(({ key, label }) => {
    const raw = frontmatter[key];
    let value;
    if (key === "Aspetto") {
      value = cleanHtml(raw);
    } else if (typeof raw === "string" && raw.includes("[[")) {
      value = resolveWikilink(raw);
    } else {
      value = String(raw);
    }
    return `
        <tr>
          <th>${label}</th>
          <td>${value}</td>
        </tr>`;
  }).join("");
  const aspetto = frontmatter["Aspetto"];
  const aspettoRow = aspetto ? `<tr><th>Aspetto</th><td>${cleanHtml(aspetto)}</td></tr>` : "";
  if (!imageHtml && !rows && !aspettoRow) return "";
  return `
<div class="chronicler-infobox">
  <div class="infobox-title">${title}</div>
  ${imageHtml}
  <table class="infobox-table">
    <tbody>
      ${rows}
      ${aspettoRow}
    </tbody>
  </table>
</div>
`;
}
var INFOBOX_CSS = `
.chronicler-infobox {
  float: right;
  clear: right;
  margin: 0 0 1rem 1.5rem;
  border: 1px solid var(--gray);
  border-radius: 8px;
  background: var(--light);
  min-width: 220px;
  max-width: 280px;
  font-size: 0.85rem;
  overflow: hidden;
}

.infobox-title {
  background: var(--secondary);
  color: var(--light);
  text-align: center;
  font-weight: bold;
  padding: 6px 10px;
  font-size: 0.95rem;
}

.infobox-image-container {
  text-align: center;
  padding: 8px;
  border-bottom: 1px solid var(--gray);
}

.infobox-image {
  max-width: 100%;
  border-radius: 4px;
}

.infobox-table {
  width: 100%;
  border-collapse: collapse;
}

.infobox-table th,
.infobox-table td {
  padding: 4px 8px;
  vertical-align: top;
  border-top: 1px solid var(--lightgray);
}

.infobox-table th {
  font-weight: 600;
  white-space: nowrap;
  color: var(--darkgray);
  width: 40%;
}

@media (max-width: 600px) {
  .chronicler-infobox {
    float: none;
    max-width: 100%;
    margin: 0 0 1rem 0;
  }
}
`;
var ChroniclerInfobox = () => {
  return {
    name: "ChroniclerInfobox",
    externalResources() {
      return {
        css: [{ content: INFOBOX_CSS }]
      };
    },
    markdownPlugins() {
      return [
        () => (tree, file) => {
          const fm = file.data?.frontmatter;
          if (!fm) return;
          const title = String(fm["title"] ?? file.stem ?? "");
          const infoboxHtml = buildInfobox(fm, title);
          if (!infoboxHtml) return;
          const infoboxNode = {
            type: "html",
            value: infoboxHtml
          };
          tree.children.unshift(infoboxNode);
        }
      ];
    }
  };
};
export {
  ChroniclerInfobox
};
