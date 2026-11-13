export const normalizeElements = (elements) => {
  return elements.map((element) => {
    const normalized = { ...element };

    delete normalized.updated;
    delete normalized.version;
    delete normalized.versionNonce;

    normalized.boundElements = normalized.boundElements || [];

    if (element.type === "freedraw") {
      normalized.lastCommittedPoint = null;
    }

    return normalized;
  });
};