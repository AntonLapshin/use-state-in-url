import { useCallback, useEffect, useRef, useState } from "react";
import { deserialize, serialize, Param } from "./serializeParams";
import { parseSearch, buildSearch, isEqual, SearchParams } from "./urlUtils";

export interface Location {
  pathname: string;
  search: string;
}

export type Navigate = (url: string) => void;

type ParamConfig<T> = string | Param<T>;

function normalizeParam<T>(param: ParamConfig<T>): Param<T> {
  return typeof param === "string" 
    ? { name: param, defaultValue: "" as T }
    : param;
}

function getParamValue<T>(
  param: Param<T>,
  searchParams: SearchParams
): T {
  const value = searchParams.get(param.name);
  return value !== undefined && value !== null
    ? deserialize(param.defaultValue, value)
    : param.defaultValue;
}

export function useStateInUrl<T>(
  param: ParamConfig<T>,
  opts: { location: Location; navigate: Navigate }
): [
  T,
  (value: T) => void,
  (value: T | undefined) => (params: SearchParams) => SearchParams
] {
  const { location, navigate } = opts;
  const locationRef = useRef(location);
  const config = useRef(normalizeParam(param));
  
  const getValue = () => {
    const searchParams = parseSearch(location.search);
    return getParamValue(config.current, searchParams);
  };
  
  const [value, setValue] = useState<T>(getValue);

  useEffect(() => {
    locationRef.current = location;
    const newValue = getValue();
    if (!isEqual(newValue, value)) {
      setValue(newValue);
    }
  }, [location.search, location.pathname]);

  const createUpdater = useCallback(
    (newValue: T | undefined) => (params: SearchParams) => {
      setValue(newValue as T);
      
      if (newValue === undefined) {
        params.delete(config.current.name);
      } else {
        const serialized = serialize(config.current.defaultValue, newValue);
        params.set(config.current.name, serialized);
      }
      
      return params;
    },
    []
  );

  const update = useCallback(
    (newValue: T) => {
      const params = parseSearch(locationRef.current.search);
      createUpdater(newValue)(params);
      const search = buildSearch(params);
      navigate(`${locationRef.current.pathname}${search}`);
    },
    [createUpdater, navigate]
  );

  return [value, update, createUpdater];
}

export function useBatchUpdate(opts: { location: Location; navigate: Navigate }) {
  const { location, navigate } = opts;
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const batchUpdate = useCallback(
    (
      updates: Array<(params: SearchParams) => SearchParams>,
      options: { includeExisting?: boolean; path?: string } = {}
    ) => {
      const { includeExisting = true, path } = options;
      
      let params = includeExisting 
        ? parseSearch(locationRef.current.search)
        : new Map<string, string>();

      params = updates.reduce((acc, update) => update(acc), params);
      
      const search = buildSearch(params);
      const pathname = path || locationRef.current.pathname;
      
      navigate(`${pathname}${search}`);
    },
    [navigate]
  );

  return { batchUpdate };
}

export { parseSearch as parseQueryString, buildSearch as createQueryString };
