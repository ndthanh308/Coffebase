import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { supabaseClient } from '../../infrastructure-layer/database/supabase-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readSeedFile() {
  const seedPath = path.join(__dirname, 'products.seed.json');
  const raw = await fs.readFile(seedPath, 'utf-8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('Seed file must be a JSON array');
  }

  const cleaned = parsed
    .map((p) => ({
      name: String(p.name || '').trim(),
      description: String(p.description || '').trim(),
      price: Number(p.price),
      category: String(p.category || 'other').trim(),
      image_url: p.image_url ?? null,
      is_active: p.is_active !== undefined ? Boolean(p.is_active) : true
    }))
    .filter((p) => p.name && Number.isFinite(p.price));

  return cleaned;
}

async function fetchExistingNames(names) {
  if (names.length === 0) return new Set();

  const { data, error } = await supabaseClient
    .from('products')
    .select('name')
    .in('name', names);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return new Set((data || []).map((r) => r.name));
}

async function insertProducts(products) {
  if (products.length === 0) return [];

  const rows = products.map((p) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    image_url: p.image_url,
    is_active: p.is_active,
    created_at: new Date().toISOString()
  }));

  const { data, error } = await supabaseClient.from('products').insert(rows).select();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
}

async function main() {
  const seedProducts = await readSeedFile();

  const names = seedProducts.map((p) => p.name);
  const existing = await fetchExistingNames(names);

  const toInsert = seedProducts.filter((p) => !existing.has(p.name));

  console.log(`Seed file: ${seedProducts.length} products`);
  console.log(`Existing in DB (matched by name): ${existing.size}`);
  console.log(`Will insert: ${toInsert.length}`);

  const inserted = await insertProducts(toInsert);

  console.log(`Inserted: ${inserted.length}`);
  if (inserted.length > 0) {
    console.log('Inserted names:', inserted.map((p) => p.name).join(', '));
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
