import { useCallback, useEffect, useRef, useState, MutableRefObject } from "react";
import { Deserializers, Serializers, StateParam, ParamType } from "./serializeParams";

export interface LocationLike {
  pathname: string;
  search: string;
}

export type NavigateFn = (url: string) => void;

type SearchParams = Map<string, string>;

export const getUrlParam = <T>(
  param: string | StateParam<T>,
  location: LocationLike,
  defaultValue: MutableRefObject<T | undefined>
) => {
  const searchParams = parseQueryString(location);
  const urlParam: StateParam<T> =
    typeof param === "string"
      ? {
          name: param,
          type: "string",
          defaultValue: defaultValue.current,
        }
      : param;
  const urlValue = searchParams.get(urlParam.name);
  if (urlValue === undefined || urlValue === null) {
    urlParam.currentValue = defaultValue.current;
  } else {
    urlParam.currentValue = Deserializers[urlParam.type](urlValue) as T;
  }
  return urlParam;
};

function createQueryString(searchParams: SearchParams): string {
  const keyValuePairs: string[] = [];
  for (const [key, value] of searchParams) {
    keyValuePairs.push(`${key}=${value}`);
  }
  return keyValuePairs.join("&");
}

function parseQueryString(location: LocationLike): SearchParams {
  const queryString = location.search.startsWith("?")
    ? location.search.substring(1)
    : location.search;
  const keyValuePairs = queryString
    .split("&")
    .filter((pair: string) => pair !== "");
  const searchParams = new Map<string, string>();
  keyValuePairs.forEach((pair: string) => {
    const [key, value] = pair.split("=");
    if (key) searchParams.set(key, value);
  });
  return searchParams;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export const useStateInUrl = <T>(
  param: string | StateParam<T>,
  opts: { location: LocationLike; navigate: NavigateFn }
): [
  T,
  (newValue: T) => void,
  (newValue: T | undefined) => (searchParams: SearchParams) => SearchParams
] => {
  const { location, navigate } = opts;
  const locationRef = useRef(location);

  const defaultValue = useRef(
    typeof param === "string" ? undefined : param.defaultValue
  );

  const urlParam = getUrlParam<T>(param, location, defaultValue);
  const [value, setValue] = useState(urlParam.currentValue);

  useEffect(() => {
    const newUrlParam = getUrlParam<T>(param, opts.location, defaultValue);
    if (!deepEqual(newUrlParam.currentValue, value)) {
      setValue(newUrlParam.currentValue);
    }
    locationRef.current = opts.location;
  }, [opts.location.search, opts.location.pathname]);

  const mutateValue = useCallback(
    (newValue: T | undefined) => (searchParams: SearchParams) => {
      setValue(newValue as T);
      if (newValue === undefined) {
        searchParams.delete(urlParam.name);
      } else {
        const serializer = (Serializers as Record<ParamType, (v: unknown) => string>)[
          urlParam.type
        ];
        searchParams.set(urlParam.name, serializer(newValue as unknown));
      }
      return searchParams;
    },
    [urlParam.name, urlParam.type]
  );

  const update = useCallback(
    (newValue: T) => {
      const searchParams = parseQueryString(locationRef.current);
      const newSearchParams = mutateValue(newValue)(searchParams);
      const newQueryString = createQueryString(newSearchParams);
      navigate(`${locationRef.current.pathname}?${newQueryString}`);
    },
    [mutateValue, navigate]
  );

  return [value as T, update, mutateValue];
};

export const useBatchUpdate = (
  opts: { location: LocationLike; navigate: NavigateFn }
) => {
  const { location, navigate } = opts;
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location.search, location.pathname]);

  const batchUpdate = useCallback(
    (
      updates: Array<(searchParams: SearchParams) => SearchParams>,
      includeExisting: boolean = true,
      replacePath?: string
    ) => {
      let searchParams: SearchParams = new Map();
      if (includeExisting) {
        searchParams = parseQueryString(locationRef.current);
      }

      const newSearchParams = updates.reduce((acc, update) => {
        return update(acc);
      }, searchParams);

      const newQueryString = createQueryString(newSearchParams);

      if (replacePath) {
        navigate(`${replacePath}?${newQueryString}`);
      } else {
        navigate(`?${newQueryString}`);
      }
    },
    [navigate]
  );

  return { batchUpdate };
};

export { parseQueryString, createQueryString };
