export type ParamType = "string" | "number" | "boolean" | "object" | "array";

export type ValueType = {
  string: string;
  number: number;
  boolean: boolean;
  object: Record<string, unknown>;
  array: unknown[];
};

export type Deserializer<T extends ParamType> = (value: string) => ValueType[T];

export interface StateParam<T> {
  name: string;
  type: ParamType;
  defaultValue?: T;
  currentValue?: T;
}

const parseJson = (value: string, fallback: unknown) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
};

export const Deserializers: { [K in ParamType]: Deserializer<K> } = {
  string: (value: string) => decodeURIComponent(value),
  number: (value: string) => Number(value),
  boolean: (value: string) => value.toLowerCase() === "true",
  object: (value: string) => parseJson(decodeURIComponent(value), {}),
  array: (value: string) =>
    value.split(",").map((v) => decodeURIComponent(v)),
};

export const Serializers: { [K in ParamType]: (value: ValueType[K]) => string } = {
  string: (value: string) => value,
  number: (value: number) => value.toString(),
  boolean: (value: boolean) => (value ? "true" : "false"),
  object: (value: Record<string, unknown>) =>
    encodeURIComponent(JSON.stringify(value)),
  array: (value: unknown[]) => value.join(","),
};
