export const brand = {
  name: "ServiceDesk",
  tagline: "Service management",
  accentColor: "#236653",
  logoUrl: "",
  faviconUrl: "",
  headline: "A clean home.\nA clearer day.",
  description:
    "Book your next clean, review quotes, and keep track of your services.",
};

function assetUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(
      value,
      window.location.origin + (process.env.PUBLIC_URL || "") + "/",
    );
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

export async function loadBrand() {
  try {
    const response = await fetch(
      `${process.env.PUBLIC_URL || ""}/branding.json`,
      {
        cache: "no-cache",
        signal: AbortSignal.timeout(5000),
      },
    );
    if (response.ok) {
      const config = await response.json();
      for (const key of ["name", "tagline", "headline", "description"]) {
        if (typeof config[key] === "string" && config[key].trim())
          brand[key] = config[key].trim().slice(0, 300);
      }
      if (/^#[0-9a-f]{6}$/i.test(config.accentColor))
        brand.accentColor = config.accentColor;
      brand.logoUrl = assetUrl(config.logoUrl);
      brand.faviconUrl = assetUrl(config.faviconUrl);
    }
  } catch {
    // The default brand keeps the app usable if deployment configuration is unavailable.
  }

  const rgb = brand.accentColor
    .slice(1)
    .match(/../g)
    .map((value) => parseInt(value, 16));
  const mix = (target, amount) =>
    `rgb(${rgb.map((value) => Math.round(value + (target - value) * amount)).join(", ")})`;
  const luminance = rgb
    .map((value) => {
      const channel = value / 255;
      return channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    })
    .reduce(
      (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
      0,
    );
  const style = document.documentElement.style;
  style.setProperty("--accent", brand.accentColor);
  style.setProperty("--accent-hover", mix(0, 0.18));
  style.setProperty("--accent-soft", mix(255, 0.93));
  style.setProperty("--accent-ink", mix(0, 0.35));
  style.setProperty("--accent-border", mix(255, 0.8));
  style.setProperty("--accent-wash", mix(255, 0.87));
  style.setProperty(
    "--accent-contrast",
    luminance > 0.179 ? "#17201c" : "#ffffff",
  );
  document.title = brand.name;
  document.querySelector('meta[name="description"]').content =
    brand.description;
  document.querySelector('meta[name="theme-color"]').content =
    brand.accentColor;
  const favicon = document.querySelector('link[rel="icon"]');
  if (brand.faviconUrl) favicon.removeAttribute("type");
  favicon.href =
    brand.faviconUrl ||
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="${brand.accentColor}"/><path d="M10 19 20 10l10 9v12H23v-8h-6v8h-7Z" fill="none" stroke="${luminance > 0.179 ? "#17201c" : "white"}" stroke-width="2" stroke-linejoin="round"/></svg>`)}`;
}
