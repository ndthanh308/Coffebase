import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { supabaseClient } from '../../infrastructure-layer/database/supabase-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readSeedFile() {
  const seedPath = path.join(__dirname, 'about.seed.json');
  const raw = await fs.readFile(seedPath, 'utf-8');
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Seed file must be an object with { group, members }');
  }

  const group = parsed.group || null;
  const members = Array.isArray(parsed.members) ? parsed.members : [];

  return { group, members };
}

async function upsertRow(row, conflictColumns) {
  const { data, error } = await supabaseClient
    .from('about_us')
    .upsert(row, { onConflict: conflictColumns })
    .select();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
}

async function main() {
  const { group, members } = await readSeedFile();

  const now = new Date().toISOString();

  if (group) {
    await upsertRow(
      {
        type: 'group',
        name: String(group.name || 'Newbie Coders').trim(),
        description: String(group.description || '').trim(),
        sort_order: 0,
        is_active: true,
        updated_at: now
      },
      'type,name'
    );
  }

  const cleanedMembers = members
    .map((m) => ({
      type: 'member',
      name: String(m.name || '').trim(),
      title: String(m.title || '').trim() || null,
      roles: Array.isArray(m.roles) ? m.roles.map((r) => String(r).trim()).filter(Boolean) : null,
      motto: String(m.motto || '').trim() || null,
      image_url: m.image_url ?? null,
      description: null,
      sort_order: Number.isFinite(Number(m.sort_order)) ? Number(m.sort_order) : 0,
      is_active: true,
      updated_at: now
    }))
    .filter((m) => m.name);

  for (const member of cleanedMembers) {
    await upsertRow(member, 'type,name');
  }

  console.log(`Seeded about_us: group=${group ? 'yes' : 'no'}, members=${cleanedMembers.length}`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  console.error(
    'If this says relation "about_us" does not exist, run infrastructure-layer/database/migrations/002_about_us.sql in Supabase SQL editor first.'
  );
  process.exit(1);
});
