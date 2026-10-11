const validStatuses = new Set(['Applied', 'Interview', 'Offered', 'Placed']);

export class StudentQueryError extends Error {
  constructor(message) {
    super(message);
    this.name = "StudentQueryError";
    this.status = 400;
  }
}

function readScalar(query, key) {
  const value = query[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new StudentQueryError(`Query parameter "${key}" must be a single value`);
  }
  return value;
}

function parsePositiveInteger(value, key, fallback, maxValue = Number.MAX_SAFE_INTEGER) {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) {
    throw new StudentQueryError(`Query parameter "${key}" must be a positive integer`);
  }
  const parsed = Number(value);
  if (parsed < 1 || parsed > maxValue) {
    throw new StudentQueryError(`Query parameter "${key}" must be between 1 and ${maxValue}`);
  }
  if (!Number.isSafeInteger(parsed)) {
    throw new StudentQueryError(`Query parameter "${key}" must be a safe positive integer`);
  }
  return parsed;
}

export function buildStudentQuery(query = {}) {
  const q = (readScalar(query, "q") ?? readScalar(query, "search") ?? "").trim();
  const status = (readScalar(query, "status") ?? "").trim();
  const page = parsePositiveInteger(readScalar(query, "page"), "page", 1);

  const pageSizeValue = readScalar(query, "pageSize");
  const limitValue = readScalar(query, "limit");
  if (pageSizeValue !== undefined && limitValue !== undefined && pageSizeValue !== limitValue) {
    throw new StudentQueryError('Query parameters "pageSize" and "limit" must match when both are provided');
  }
  const pageSize = parsePositiveInteger(
    pageSizeValue ?? limitValue,
    pageSizeValue === undefined ? "limit" : "pageSize",
    10,
    100
  );

  if (status && status !== "All statuses" && !validStatuses.has(status)) {
    throw new StudentQueryError("Query parameter \"status\" is not a valid placement status");
  }

  const normalizedStatus = validStatuses.has(status) ? status : "";
  const normalizedSearch = q.replace(/\s+/g, " ");

  return {
    filter: {
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
      ...(normalizedSearch ? { search: normalizedSearch } : {}),
    },
    page,
    pageSize,
  };
}