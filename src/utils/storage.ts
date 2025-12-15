import { AppData } from '../types';
import { defaultCategories } from '../data/defaultCategories';

const STORAGE_KEY = 'recurring-todo-app';
const CURRENT_SCHEMA_VERSION = 1;

export function loadAppData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return getDefaultAppData();
  }

  try {
    const data = JSON.parse(raw) as AppData;
    return migrateIfNeeded(data);
  } catch (e) {
    console.error('Failed to parse stored data, resetting to defaults', e);
    localStorage.setItem(`${STORAGE_KEY}-corrupt-${Date.now()}`, raw);
    return getDefaultAppData();
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function migrateIfNeeded(data: AppData): AppData {
  // Future migrations go here
  // if (data.schemaVersion < 2) { data = migrateV1toV2(data); }
  return data;
}

function getDefaultAppData(): AppData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    tasks: [],
    completionRecords: [],
    categories: [...defaultCategories],
  };
}
