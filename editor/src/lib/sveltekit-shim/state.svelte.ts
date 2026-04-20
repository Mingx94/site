// Shim for SvelteKit's `$app/state` module. Site components (e.g. Cover)
// read `page.params.slug` to know which post they're rendering. The editor
// provides the slug from the currently-previewed file, so the same components
// render correctly inside Electron without SvelteKit's runtime.

let _slug = $state('');

export const page = {
  get params() {
    return { slug: _slug };
  },
};

export function setCurrentSlug(slug: string) {
  _slug = slug;
}

export function getCurrentSlug(): string {
  return _slug;
}
