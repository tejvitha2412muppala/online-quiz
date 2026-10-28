const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseReady = Boolean(
  supabaseUrl
  && serviceRoleKey
  && !supabaseUrl.includes('your-project-id')
  && !serviceRoleKey.startsWith('replace-with-')
);

// This privileged client must only be used by trusted server-side code.
const supabase = supabaseReady
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

module.exports = { supabase, supabaseReady };
