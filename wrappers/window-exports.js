// Compatibility wrapper: attach module exports to window for legacy code paths.
(function () {
    // If modules are available as globals (after bundling), do nothing.
    if (typeof window === 'undefined') return;

    // The actual module bundler should populate these; if not, keep existing window values.
    // This file is intentionally minimal; bundlers should replace it or bundle the modules directly.
})();
