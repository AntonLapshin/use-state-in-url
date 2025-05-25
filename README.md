# use-state-in-url

[![minified + gzip](https://badgen.net/bundlephobia/minzip/use-state-in-url)](https://bundlephobia.com/result?p=use-state-in-url) [![dependencies](https://badgen.net/bundlephobia/dependency-count/use-state-in-url)](https://bundlephobia.com/result?p=use-state-in-url)

`use-state-in-url` is a small React utility that stores state in the URL query string. It works like `useState` but allows your users to share deep links and navigate back and forward through application state.

This package has **zero dependencies** and you can try it live on the [demo website](https://antonlapshin.github.io/use-state-in-url/).

```bash
npm install use-state-in-url
```

## Basic Usage

```tsx
import { useStateInUrl } from 'use-state-in-url';

function Search({ location, navigate }) {
  const [term, setTerm] = useStateInUrl('term', { location, navigate });

  return (
    <input value={term} onChange={e => setTerm(e.target.value)} />
  );
}
```

## Supported Types

The hook can store different types in the URL. Specify the type using a `StateParam` object:

```tsx
const [page, setPage] = useStateInUrl<number>({ name: 'page', type: 'number', defaultValue: 1 }, { location, navigate });
const [active, setActive] = useStateInUrl<boolean>({ name: 'active', type: 'boolean', defaultValue: false }, { location, navigate });
const [tags, setTags] = useStateInUrl<string[]>({ name: 'tags', type: 'array', defaultValue: [] }, { location, navigate });
const [filters, setFilters] = useStateInUrl<Record<string, unknown>>({ name: 'filters', type: 'object', defaultValue: {} }, { location, navigate });
```

## Creating a Wrapper Hook

When used with `react-router`, you typically want a wrapper so that `location` and `navigate` don't have to be passed each time:

```tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useStateInUrl } from 'use-state-in-url';

export function useStateInRouter<T>(param: string | StateParam<T>) {
  const navigate = useNavigate();
  const location = useLocation();
  return useStateInUrl(param, { navigate: url => navigate(url), location });
}
```

## Batch Updates

Multiple parameters can be updated at once using `useBatchUpdate`:

```tsx
import { useBatchUpdate } from 'use-state-in-url';

function Filters({ location, navigate }) {
  const { batchUpdate } = useBatchUpdate({ location, navigate });

  const apply = () => {
    batchUpdate([
      setTerm('hello'),
      setPage(2)
    ]);
  };
}
```

The updater functions returned from `useStateInUrl` can be passed directly to `batchUpdate`.

## License

MIT
