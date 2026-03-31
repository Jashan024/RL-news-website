import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here';

// Create a mock client when Supabase isn't configured
const mockResponse = { data: [], error: null, count: 0 };
const mockQuery = () => {
  const chain = {
    select: () => chain,
    insert: () => Promise.resolve(mockResponse),
    update: () => chain,
    delete: () => chain,
    eq: () => chain,
    neq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve) => resolve(mockResponse),
  };
  // Make chain thenable
  chain[Symbol.toStringTag] = 'Promise';
  chain.then = (resolve) => Promise.resolve(mockResponse).then(resolve);
  chain.catch = (fn) => Promise.resolve(mockResponse).catch(fn);
  return chain;
};

const mockStorage = {
  from: () => ({
    upload: () => Promise.resolve({ data: { path: 'mock' }, error: null }),
    getPublicUrl: () => ({ data: { publicUrl: 'https://placehold.co/400x300/e0e0e0/999?text=No+Image' } }),
  }),
};

const mockClient = {
  from: () => mockQuery(),
  storage: mockStorage,
};

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : mockClient;
export const isSupabaseConfigured = isConfigured;
