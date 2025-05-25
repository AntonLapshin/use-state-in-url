import React, { useState, useEffect, useCallback } from "react";
import { useStateInUrl, useBatchUpdate } from "use-state-in-url";
import "./App.css";

interface LocationLike {
  pathname: string;
  search: string;
}

function useBrowserHistory() {
  const [loc, setLoc] = useState<LocationLike>({
    pathname: window.location.pathname,
    search: window.location.search,
  });

  useEffect(() => {
    const onPop = () =>
      setLoc({
        pathname: window.location.pathname,
        search: window.location.search,
      });
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((url: string) => {
    window.history.pushState({}, "", url);
    setLoc({
      pathname: window.location.pathname,
      search: window.location.search,
    });
  }, []);

  return { location: loc, navigate };
}

function Demo() {
  const { location, navigate } = useBrowserHistory();
  const [searchTerm, setSearchTerm, mutateSearchTerm] = useStateInUrl("q", {
    location,
    navigate,
  });
  const [page, setPage, mutatePage] = useStateInUrl(
    { name: "page", defaultValue: 1 },
    { location, navigate }
  );
  const [isActive, setIsActive, mutateIsActive] = useStateInUrl(
    { name: "active", defaultValue: false },
    { location, navigate }
  );
  const [selectedTags, setSelectedTags] = useStateInUrl(
    { name: "tags", defaultValue: [] as string[] },
    { location, navigate }
  );
  const [filters, setFilters] = useStateInUrl(
    { name: "filters", defaultValue: {} as Record<string, string> },
    { location, navigate }
  );
  const { batchUpdate } = useBatchUpdate({ location, navigate });

  const handleBatchUpdate = () => {
    batchUpdate([
      mutateSearchTerm("hello world"),
      mutatePage(page + 1),
      mutateIsActive(!isActive),
    ]);
  };

  const handleAddTag = () => {
    const newTag = `tag-${selectedTags.length + 1}`;
    setSelectedTags([...selectedTags, newTag]);
  };

  const handleRemoveTag = (index: number) => {
    setSelectedTags(selectedTags.filter((_, i) => i !== index));
  };

  return (
    <div className="demo-section">
      <h2>Interactive Demo</h2>
      <p>Try changing the values below and watch the URL update in real-time!</p>
      
      <div className="demo-grid">
        <div className="demo-item">
          <label>
            Search Term:
            <input 
              type="text"
              value={String(searchTerm || "")} 
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
            />
          </label>
        </div>

        <div className="demo-item">
          <label>
            Page:
            <input
              type="number"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              min="1"
            />
          </label>
        </div>

        <div className="demo-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </div>

        <div className="demo-item tags-section">
          <div className="tags-header">
            <span>Tags:</span>
            <button onClick={handleAddTag} className="btn-small">Add Tag</button>
          </div>
          <div className="tags-list">
            {selectedTags.length === 0 && <span className="no-tags">No tags selected</span>}
            {selectedTags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button
                  onClick={() => handleRemoveTag(index)}
                  className="tag-remove"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="demo-item">
          <button 
            onClick={() => setFilters({ category: "electronics", brand: "apple" })}
            className="btn"
          >
            Set Sample Filters
          </button>
          {Object.keys(filters).length > 0 && (
            <div className="filters-display">
              <pre>{JSON.stringify(filters, null, 2)}</pre>
              <button onClick={() => setFilters({})} className="btn-small">Clear</button>
            </div>
          )}
        </div>

        <div className="demo-item batch-update">
          <button onClick={handleBatchUpdate} className="btn btn-primary">
            Batch Update (Multiple Changes)
          </button>
          <span className="batch-info">Sets search="hello world", increments page, toggles active</span>
        </div>
      </div>

      <div className="url-display">
        <strong>Current URL:</strong>
        <code>{location.pathname + location.search}</code>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>
          <span className="logo">🔗</span> use-state-in-url
        </h1>
        <p className="subtitle">React hook for managing state in URL query parameters</p>
        <div className="badges">
          <a href="https://github.com/antonlapshin/use-state-in-url" target="_blank" rel="noopener noreferrer" className="badge">
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/use-state-in-url" target="_blank" rel="noopener noreferrer" className="badge">
            npm
          </a>
        </div>
      </header>

      <Demo />

      <section className="docs">
        <h2>Installation</h2>
        <pre className="code-block">npm install use-state-in-url</pre>

        <h2>Basic Usage</h2>
        <pre className="code-block">{`import { useStateInUrl } from "use-state-in-url";

function Search({ location, navigate }) {
  // String params default to empty string
  const [term, setTerm] = useStateInUrl("term", { location, navigate });

  return <input value={term} onChange={(e) => setTerm(e.target.value)} />;
}`}</pre>

        <h2>Type-Safe Parameters</h2>
        <p>The type is automatically inferred from the defaultValue:</p>
        <pre className="code-block">{`// Number
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
);`}</pre>

        <h2>React Router Integration</h2>
        <pre className="code-block">{`import { useNavigate, useLocation } from "react-router-dom";
import { useStateInUrl, Param } from "use-state-in-url";

export function useStateInRouter<T>(
  param: string | Param<T>,
  defaultValue?: T
) {
  const navigate = useNavigate();
  const location = useLocation();
  return useStateInUrl(
    param, 
    { navigate: (url) => navigate(url), location }, 
    defaultValue
  );
}`}</pre>

        <h2>Batch Updates</h2>
        <p>Update multiple URL parameters in a single navigation:</p>
        <pre className="code-block">{`const [term, setTerm, setTermUpdater] = useStateInUrl("term", opts);
const [page, setPage, setPageUpdater] = useStateInUrl(
  { name: "page", defaultValue: 1 }, 
  opts
);
const { batchUpdate } = useBatchUpdate(opts);

// Update both parameters at once
batchUpdate([
  setTermUpdater("hello"),
  setPageUpdater(2)
]);`}</pre>

        <h2>Features</h2>
        <ul>
          <li>✅ Zero dependencies</li>
          <li>✅ TypeScript support with type inference</li>
          <li>✅ Works with any routing library</li>
          <li>✅ Supports all common data types</li>
          <li>✅ Batch updates for performance</li>
          <li>✅ Browser back/forward navigation</li>
        </ul>
      </section>

      <footer>
        <p>
          Created with ❤️ by <a href="https://github.com/antonlapshin" target="_blank" rel="noopener noreferrer">Anton Lapshin</a>
        </p>
      </footer>
    </div>
  );
}
