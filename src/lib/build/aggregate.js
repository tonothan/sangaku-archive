const { getCanopyCollection } = require("./shape");
const { getEntries } = require("../iiif/label");
const { getUniqueSlug } = require("./slug");
const { log } = require("./log");
const { getRootCollection, getBulkManifests } = require("./request");
const { buildIndexData } = require("./search");
const { buildFacets } = require("./facets");

const fs = require("fs").promises;
const fsSync = require("fs");

module.exports.build = async (env) => {
  const { baseUrl } = env;
  const canopyDirectory = ".canopy";

  log(`Building Canopy from IIIF Collection...\n`);
  log(`${env.collection}\n\n`, "yellow");

  /**
   * Create Canopy directory if it doesn't exist.
   */
  if (!fsSync.existsSync(canopyDirectory)) {
    await fs.mkdir(canopyDirectory);
  }

  /**
   * Retrieve IIIF Collection for Canopy and write to file.
   */
  const json = await getRootCollection(env.collection);
  const canopyCollection = getCanopyCollection({
    ...json,
    label: env.label || json.label,
    summary: env.summary || json.summary,
  });

  await fs.writeFile(
    `${canopyDirectory}/collections.json`,
    JSON.stringify([canopyCollection])
  );

/**
 * Extracts a slug from a IIIF manifest ID URL, based on the filename.
 * Removes the `.json` extension and handles trailing slashes.
 * 
 * Example:
 *   https://example.org/iiif/manifest-001.json → manifest-001
 *   https://example.org/iiif/folder/manifest-002.json → manifest-002
 * 
 * This was generated with assistance from ChatGPT to allow Canopy to generate
 * slugs based on manifest filenames rather than labels.
 */
function getSlugFromManifestId(manifestId) {
  try {
    const url = new URL(manifestId);
    const parts = url.pathname.split('/');
    // Handles cases where there's a trailing slash at the end
    const filename = parts.pop() || parts.pop();
    // Remove .json extension if present
    return filename.replace(/\.json$/i, '');
  } catch (e) {
    // Return fallback slug if ID isn't a valid URL
    return 'unknown';
  }
} 
  /**
   * Filter items to only include Manifests, add index, and
   * then retrieve all in bulk in chunks of set amount (10).
   */
  const manifestListing = canopyCollection.items
    .filter((item) => item.type === "Manifest")
    .map((item, index) => {
      return {
        collectionId: item.parent,
        id: item.id,
        index,
        label: item.label,
      };
    });

  log(`Creating Manifest listing...\n`);

  const manifests = await getBulkManifests(manifestListing, 10);

  /**
   * Prepare Manifests for Canopy and write to file.
   */
  let rootSlugs = {};
  const canopyManifests = manifests
    .map((manifest) => {
      // Get the earlier defined index of the Manifest in the collection.
      const manifestListed = manifestListing.find(
        (item) => item.id === manifest?.id
      );

      if (!manifestListed) return;

      const { index } = manifestListed;

      // Create a unique slug for the Manifest.
      const string = getSlugFromManifestId(manifest.id);
      const { slug, allSlugs } = getUniqueSlug(string, rootSlugs);
      rootSlugs = allSlugs;

      // Return the Manifest with an index, slug, and prescribed thumbnail.
      return {
        ...manifest,
        index,
        slug,
        thumbnail: manifest.thumbnail,
      };
    })
    .filter((manifest) => manifest);

  await fs.writeFile(
    `${canopyDirectory}/manifests.json`,
    JSON.stringify(canopyManifests)
  );

  /**
   * Log the success ratio of Manifests retrieved.
   */
  const successRatio = `${canopyManifests.length}/${manifests.length}`;
  log(`\n${successRatio} Manifests(s) retrieved successfully.\n`);

  /**
   * Prepare facet metadata and search index for Canopy and write to file.
   */
  let canopyMetadata = [];
  let canopySearch = [];

  manifests
    .filter((manifest) => manifest?.type === "Manifest")
    .forEach((manifest) => {
      const settings = env?.search?.index;
      canopySearch.push({
        index: manifest.index,
        label: manifest?.label,
        ...(settings?.summary?.enabled && { summary: manifest.summary }),
        ...(settings?.metadata?.enabled && {
          metadata: manifest.metadata.filter((entry) =>
            settings.metadata.all
              ? entry
              : env.metadata.includes(getEntries(entry.label)[0])
          ),
        }),
      });

      manifest.metadata.forEach((metadata) => {
        const metadataLabel = getEntries(metadata.label)[0];
        const metadataValues = getEntries(metadata.value);
        if (env?.metadata?.includes(metadataLabel)) {
          metadataValues.forEach((value) => {
            canopyMetadata.push({
              index: manifest.index,
              label: metadataLabel,
              value,
            });
          });
        }
      });
    });

  log(`\nCreating facets as IIIF Collections...\n`);
  const canopyFacets = await buildFacets(
    env.metadata,
    canopyMetadata,
    canopyManifests,
    baseUrl
  );
  await fs.writeFile(
    `${canopyDirectory}/facets.json`,
    JSON.stringify(canopyFacets ? canopyFacets : [])
  );

  log(`\nBuilding search entries...\n`);
  const canopyIndex = buildIndexData(canopySearch);
  await fs.writeFile(
    `${canopyDirectory}/index.json`,
    JSON.stringify(canopyIndex)
  );

  /**
   * Good to go. 🚀
   */
  log(`\n...Ready 🚀\n\n`, "blue", { bright: true });

  return;
};
