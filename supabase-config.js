const SUPABASE_URL = "https://svkinrxcrsqxvpowucmr.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_xIJEVy55z-C8jxh9YvKDMg_SfcImOvu";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);