function normalizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (
    value &&
    typeof value === "object" &&
    value.constructor?.name === "ObjectId"
  ) {
    return value.toString();
  }

  if (
    value &&
    typeof value === "object" &&
    !(value instanceof Date)
  ) {
    const normalized = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (key === "__v") {
        continue;
      }

      if (key === "_id") {
        normalized.id = nestedValue?.toString();
        continue;
      }

      normalized[key] = normalizeValue(nestedValue);
    }

    return normalized;
  }

  return value;
}

export function serializeResource(resource) {
  if (!resource) {
    return resource;
  }

  const value =
    typeof resource.toObject === "function"
      ? resource.toObject()
      : resource;

  return normalizeValue(value);
}

export function serializeResources(resources) {
  return resources.map(serializeResource);
}