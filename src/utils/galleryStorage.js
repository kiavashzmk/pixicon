import { stateToDocument, documentToState } from './document.js';

const STORAGE_KEY = 'pixicon-gallery';

function readLocalGallery() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalGallery(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function loadManifest() {
  try {
    const res = await fetch('/gallery/manifest.json');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function loadAllIcons() {
  const manifest = await loadManifest();
  const staticIcons = await Promise.all(
    manifest.map(async (entry) => {
      try {
        const res = await fetch(`/gallery/${entry.file}`);
        if (!res.ok) return null;
        const doc = await res.json();
        return { ...entry, doc, source: 'static' };
      } catch {
        return null;
      }
    })
  );

  const localEntries = readLocalGallery();
  const localIcons = localEntries.map(entry => ({
    ...entry,
    source: 'local',
  }));

  return [
    ...staticIcons.filter(Boolean),
    ...localIcons,
  ];
}

export function saveIcon(name, state) {
  const doc = stateToDocument(state);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const entry = {
    id,
    name,
    doc,
    createdAt: new Date().toISOString(),
  };

  const entries = readLocalGallery();
  entries.push(entry);
  writeLocalGallery(entries);
  return entry;
}

export function deleteIcon(id) {
  const entries = readLocalGallery();
  writeLocalGallery(entries.filter(e => e.id !== id));
}

export function docToState(doc) {
  return documentToState(doc);
}
