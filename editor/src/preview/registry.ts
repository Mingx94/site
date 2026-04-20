// Registry maps mdsvex tag names to the actual Svelte components used in
// preview. The single source of truth for these components is
// site/src/content/components/, so the editor and the published site stay in
// visual lockstep.

import Notice from '$content/components/Notice.svelte';
import Tabs from '$content/components/Tabs.svelte';
import Tab from '$content/components/Tab.svelte';
import Cover from '$content/components/Cover.svelte';
import Video from '$content/components/Video.svelte';
import Accordion from '$content/components/Accordion.svelte';
import Button from '$content/components/Button.svelte';

export const registry = {
  Notice,
  Tabs,
  Tab,
  Cover,
  Video,
  Accordion,
  Button,
} as const;

export type RegistryKey = keyof typeof registry;
