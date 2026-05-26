/**
 * Run: node scripts/check-supabase.mjs
 * Verifies your live Supabase schema matches what SpendWise expects.
 */
import { readFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(root, '.env')

if (!existsSync(envPath)) {
  console.error('❌ Missing .env — copy .env.example to .env and add Supabase keys.')
  process.exit(1)
}

const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    })
)

const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('❌ Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const sb = createClient(url, key)

const EXPECTED = {
  profiles: ['id', 'full_name', 'phone', 'avatar_url', 'currency', 'created_at', 'updated_at'],
  expenses: ['id', 'user_id', 'title', 'amount', 'category', 'date', 'notes', 'created_at', 'updated_at'],
}

let failed = 0

async function checkColumn(table, col) {
  const { error } = await sb.from(table).select(col).limit(0)
  if (error?.message?.includes('does not exist') || error?.message?.includes('schema cache')) {
    console.log(`  ❌ ${table}.${col} — missing`)
    failed++
    return false
  }
  if (error && error.code !== 'PGRST116') {
    console.log(`  ⚠️  ${table}.${col} — ${error.message}`)
  } else {
    console.log(`  ✅ ${table}.${col}`)
  }
  return true
}

console.log('\nSpendWise Supabase schema check\n')
console.log('Project:', url.replace(/https?:\/\//, ''))

for (const [table, cols] of Object.entries(EXPECTED)) {
  console.log(`\n${table}:`)
  for (const col of cols) await checkColumn(table, col)
}

const { error: storageErr } = await sb.storage.from('avatars').list('', { limit: 1 })
console.log('\nstorage:')
if (storageErr) {
  console.log('  ❌ avatars bucket —', storageErr.message)
  failed++
} else {
  console.log('  ✅ avatars bucket')
}

console.log(failed ? `\n❌ ${failed} issue(s). Run supabase_repair.sql in Supabase SQL Editor.\n` : '\n✅ Schema looks good.\n')
process.exit(failed ? 1 : 0)
