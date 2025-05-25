# use-state-in-url

[![minified + gzip](https://badgen.net/bundlephobia/minzip/use-state-in-url)](https://bundlephobia.com/result?p=use-state-in-url) [![dependencies](https://badgen.net/bundlephobia/dependency-count/use-state-in-url)](https://bundlephobia.com/result?p=use-state-in-url)

`use-state-in-url` is a small React utility that stores state in the URL query string. It works like `useState` but allows your users to share deep links and navigate back and forward through application state.

This package has **zero dependencies** and you can try it live on the [demo website](https://antonlapshin.github.io/use-state-in-url/).

```bash
npm install use-state-in-url
```

## Basic Usage

```tsx
import { useStateInUrl } from "use-state-in-url";

function Search({ location, navigate }) {
  // String params default to empty string
  const [term, setTerm] = useStateInUrl("term", { location, navigate });

  return <input value={term} onChange={(e) => setTerm(e.target.value)} />;
}
```

## Type-Safe Parameters with Defaults

The type of the parameter is automatically inferred from the `defaultValue`:

```tsx
// Number
const [page, setPage] = useStateInUrl(
  { name: "page", defaultValue: 1 },
  { location, navigate }
);

// Boolean
const [active, setActive] = useStateInUrl(
  { name: "active", defaultValue: false },
  { location, navigate }
);

// Array
const [tags, setTags] = useStateInUrl(
  { name: "tags", defaultValue: [] as string[] },
  { location, navigate }
);

// Object
const [filters, setFilters] = useStateInUrl(
  { name: "filters", defaultValue: {} as Record<string, unknown> },
  { location, navigate }
);
```

## Creating a Wrapper Hook

When used with `react-router`, you typically want a wrapper so that `location` and `navigate` don't have to be passed each time:

```tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useStateInUrl, Param } from "use-state-in-url";

export function useStateInRouter<T>(param: string | Param<T>) {
  const navigate = useNavigate();
  const location = useLocation();
  return useStateInUrl(param, { navigate: (url) => navigate(url), location });
}
```

## Batch Updates

Multiple parameters can be updated at once using `useBatchUpdate`:

```tsx
import { useBatchUpdate } from "use-state-in-url";

function Filters({ location, navigate }) {
  const [term, setTerm, setTermUpdater] = useStateInUrl("term", { location, navigate });
  const [page, setPage, setPageUpdater] = useStateInUrl(
    { name: "page", defaultValue: 1 },
    { location, navigate }
  );
  const { batchUpdate } = useBatchUpdate({ location, navigate });

  const apply = () => {
    batchUpdate([setTermUpdater("hello"), setPageUpdater(2)]);
  };
}
```

The updater functions returned as the third element from `useStateInUrl` can be passed directly to `batchUpdate`.

## License

MIT
