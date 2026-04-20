<script lang="ts">
  import { files, updateContent } from '$state/files.svelte';
  import { parseDoc, composeDoc } from '$lib/frontmatter';

  type Props = { path: string };
  const { path }: Props = $props();

  const content = $derived(files.byPath[path]?.content ?? '');
  const parsed = $derived(parseDoc(content));
  const fm = $derived(parsed.fm as Record<string, unknown>);
  const body = $derived(parsed.body);

  const title = $derived((fm.title as string | undefined) ?? '');
  const description = $derived((fm.description as string | undefined) ?? '');
  const date = $derived((fm.date as string | undefined) ?? '');
  const updated = $derived((fm.updated as string | undefined) ?? '');
  const draft = $derived(Boolean(fm.draft));
  const tagList = $derived(
    Array.isArray(fm.tags) ? (fm.tags as unknown[]).map(String) : [],
  );

  let tagInput = $state('');

  function update(patch: Record<string, unknown>) {
    const nextFm = { ...fm, ...patch };
    for (const k of Object.keys(nextFm)) {
      if (nextFm[k] === '' || nextFm[k] === undefined) delete nextFm[k];
    }
    updateContent(path, composeDoc(nextFm, body));
  }

  function removeTag(i: number) {
    const next = tagList.filter((_, j) => j !== i);
    update({ tags: next.length ? next : undefined });
  }

  function addTag(v: string) {
    const t = v.trim();
    if (!t) return;
    update({ tags: [...tagList, t] });
    tagInput = '';
  }
</script>

<div class="fm-form">
  <div class="fm-field">
    <label for="fm-title">title</label>
    <input
      id="fm-title"
      value={title}
      oninput={(e) => update({ title: e.currentTarget.value })}
    />
  </div>
  <div class="fm-field">
    <label for="fm-desc">description</label>
    <textarea
      id="fm-desc"
      rows="2"
      value={description}
      oninput={(e) => update({ description: e.currentTarget.value })}
    ></textarea>
  </div>
  <div class="fm-field fm-row2">
    <div>
      <label for="fm-date">date</label>
      <input
        id="fm-date"
        type="date"
        value={date}
        oninput={(e) => update({ date: e.currentTarget.value })}
      />
    </div>
    <div>
      <label for="fm-updated">updated</label>
      <input
        id="fm-updated"
        type="date"
        value={updated}
        oninput={(e) => update({ updated: e.currentTarget.value })}
      />
    </div>
  </div>
  <div class="fm-field fm-toggle">
    <label for="fm-draft">draft</label>
    <button
      id="fm-draft"
      type="button"
      class="fm-switch"
      class:on={draft}
      onclick={() => update({ draft: !draft })}
    >
      <span class="knob"></span>
      <span class="lbl">{draft ? 'true' : 'false'}</span>
    </button>
  </div>
  <div class="fm-field">
    <label for="fm-tags">tags</label>
    <div class="fm-tags" id="fm-tags">
      {#each tagList as t, i (t + i)}
        <span class="fm-tag">
          #{t}
          <button type="button" onclick={() => removeTag(i)}>×</button>
        </span>
      {/each}
      <input
        class="fm-tag-input"
        placeholder="+ add"
        bind:value={tagInput}
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag((e.currentTarget as HTMLInputElement).value);
          }
        }}
      />
    </div>
  </div>
</div>
