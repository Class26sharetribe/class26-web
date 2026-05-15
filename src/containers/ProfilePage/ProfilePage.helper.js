/**
 * ProfilePage helper utilities.
 *
 * Pure functions and constants extracted from ProfilePage.js so the page
 * component stays focused on rendering logic.
 */

// ─── Generic URL helpers ─────────────────────────────────────────────────────

/**
 * Ensure a URL string has an https:// prefix.
 * Returns null for empty / falsy input.
 *
 * @param {string} url
 * @returns {string|null}
 */
export const normalizeExternalHref = url => {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const isFullUrl = v => /^https?:\/\//i.test(v);
const stripAt = v => v.replace(/^@/, '');

// ─── Social-link URL building ─────────────────────────────────────────────────

const SOCIAL_URL_BUILDERS = {
  // LinkedIn: no @ in URLs — /in/{handle}
  linkedin: v => {
    if (isFullUrl(v)) return v;
    if (/^linkedin\.com/i.test(v)) return `https://${v}`;
    return `https://linkedin.com/in/${stripAt(v)}`;
  },
  // Instagram: no @ in URLs — /{handle}
  instagram: v => {
    if (isFullUrl(v)) return v;
    if (/^instagram\.com/i.test(v)) return `https://${v}`;
    return `https://instagram.com/${stripAt(v)}`;
  },
  // X (Twitter): no @ in URLs — /{handle}
  twitter: v => {
    if (isFullUrl(v)) return v;
    if (/^(x|twitter)\.com/i.test(v)) return `https://${v}`;
    return `https://x.com/${stripAt(v)}`;
  },
  // YouTube: @ IS required in handle URLs — /@{handle}
  youtube: v => {
    if (isFullUrl(v)) return v;
    if (/^youtube\.com/i.test(v)) return `https://${v}`;
    return `https://youtube.com/@${stripAt(v)}`;
  },
  website: v => normalizeExternalHref(v),
};

/**
 * Build a canonical social-network URL from a stored value.
 *
 * FieldUrlInput always stores values as 'https://{userInput}'. We strip that
 * prefix to recover the raw user input, then each platform builder constructs
 * the proper profile URL (e.g. https://x.com/handle, https://youtube.com/@ch).
 *
 * @param {'linkedin'|'instagram'|'twitter'|'youtube'|'website'} key - social network key
 * @param {string} value - value as stored in publicData.socialLinks
 * @returns {string|null}
 */
export const buildSocialUrl = (key, value) => {
  const full = typeof value === 'string' ? value.trim() : '';
  if (!full) return null;
  const raw = full.startsWith('https://') ? full.slice('https://'.length) : full;
  if (!raw) return null;
  const builder = SOCIAL_URL_BUILDERS[key];
  return builder ? builder(raw) : normalizeExternalHref(raw);
};

// ─── Data helpers ─────────────────────────────────────────────────────────────

/**
 * Coerce a value into a non-empty string array.
 *
 * @param {*} value
 * @returns {string[]}
 */
export const asStringList = value => {
  if (Array.isArray(value)) {
    return value.filter(v => v != null && String(v).trim() !== '');
  }
  if (value != null && String(value).trim() !== '') {
    return [String(value).trim()];
  }
  return [];
};

/**
 * Map an array of enum option IDs to their display labels using userField config.
 *
 * @param {Array} userFieldConfig - config.user.userFields
 * @param {string} key - field key (e.g. 'languages')
 * @param {string[]} ids - array of option IDs to resolve
 * @returns {string[]}
 */
export const resolveEnumLabels = (userFieldConfig, key, ids) => {
  const fieldConf = (userFieldConfig || []).find(f => f.key === key);
  if (!fieldConf?.enumOptions) return ids;
  return ids.map(id => {
    const opt = fieldConf.enumOptions.find(o => `${o.option}` === `${id}`);
    return opt?.label ?? id;
  });
};

/**
 * Recursively search a category tree for a category name by ID.
 *
 * @param {Array} categories - config.categoryConfiguration.categories
 * @param {string} id - category ID to find
 * @returns {string|null}
 */
export const findCategoryName = (categories, id) => {
  if (!categories || !id) return null;
  for (const cat of categories) {
    if (cat.id === id) return cat.name;
    const found = findCategoryName(cat.subcategories, id);
    if (found) return found;
  }
  return null;
};
