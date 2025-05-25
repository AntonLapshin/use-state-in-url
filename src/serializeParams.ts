export type ParamType = "string" | "number" | "boolean" | "object" | "array";

export type ParamValue<T extends ParamType> = 
  T extends "string" ? string :
  T extends "number" ? number :
  T extends "boolean" ? boolean :
  T extends "object" ? Record<string, unknown> :
  T extends "array" ? unknown[] :
  never;

export type InferParamType<T> = 
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends unknown[] ? "array" :
  T extends Record<string, unknown> ? "object" :
  never;

export interface Param<T = unknown> {
  name: string;
  defaultValue: T;
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export const deserialize = <T>(
  defaultValue: T,
  value: string
): T => {
  const type = inferType(defaultValue);
  
  switch (type) {
    case "string":
      return decodeURIComponent(value) as T;
    case "number":
      return Number(value) as T;
    case "boolean":
      return (value.toLowerCase() === "true") as T;
    case "object":
      return tryParseJson(decodeURIComponent(value)) as T;
    case "array":
      return value.split(",").map(decodeURIComponent) as T;
    default:
      return value as T;
  }
};

export const serialize = <T>(
  defaultValue: T,
  value: T
): string => {
  const type = inferType(defaultValue);
  
  switch (type) {
    case "string":
      return value as string;
    case "number":
      return String(value);
    case "boolean":
      return value ? "true" : "false";
    case "object":
      return encodeURIComponent(JSON.stringify(value));
    case "array":
      return (value as unknown[]).join(",");
    default:
      return String(value);
  }
};

export function inferType<T>(value: T): InferParamType<T> {
  if (typeof value === "string") return "string" as InferParamType<T>;
  if (typeof value === "number") return "number" as InferParamType<T>;
  if (typeof value === "boolean") return "boolean" as InferParamType<T>;
  if (Array.isArray(value)) return "array" as InferParamType<T>;
  if (typeof value === "object" && value !== null) return "object" as InferParamType<T>;
  return "string" as InferParamType<T>;
}
