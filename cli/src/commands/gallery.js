import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { PixiconError } from '../errors.js';

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = resolve(dirname(__filename), '..', '..', '..');
const GALLERY_DIR = resolve(PROJECT_ROOT, 'public', 'gallery');
const MANIFEST_PATH = resolve(GALLERY_DIR, 'manifest.json');

function ensureGalleryDir() {
  mkdirSync(GALLERY_DIR, { recursive: true });
}

function readManifest() {
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function writeManifest(entries) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2) + '\n');
}

function handleSave(data, document) {
  if (!document) {
    throw new PixiconError('NO_DOCUMENT', 'gallery save requires a document on stdin or --input', 'stdin');
  }

  const name = data?.name || 'Untitled';
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const file = `${id}.json`;

  ensureGalleryDir();
  writeFileSync(resolve(GALLERY_DIR, file), JSON.stringify(document, null, 2) + '\n');

  const manifest = readManifest();
  manifest.push({ id, name, file, createdAt: new Date().toISOString() });
  writeManifest(manifest);

  const previewUrl = `http://localhost:5173/?icon=${id}`;

  return {
    ...document,
    saved: { id, name, file, previewUrl },
  };
}

function handleList() {
  const manifest = readManifest();
  return { icons: manifest, count: manifest.length };
}

function handleRemove(data) {
  if (!data?.id) {
    throw new PixiconError('MISSING_PARAM', 'gallery remove requires an id in --data', 'data.id');
  }

  const manifest = readManifest();
  const entry = manifest.find(e => e.id === data.id);
  if (!entry) {
    throw new PixiconError('NOT_FOUND', `No gallery entry with id "${data.id}"`, 'data.id');
  }

  const filePath = resolve(GALLERY_DIR, entry.file);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }

  writeManifest(manifest.filter(e => e.id !== data.id));

  return { removed: data.id };
}

export function handleGallery(verb, data, document) {
  switch (verb) {
    case 'save':
      return handleSave(data, document);
    case 'list':
      return handleList();
    case 'remove':
      return handleRemove(data);
    default:
      throw new PixiconError('UNKNOWN_VERB', `Unknown gallery verb: "${verb}". Available: save, list, remove`, 'command');
  }
}
