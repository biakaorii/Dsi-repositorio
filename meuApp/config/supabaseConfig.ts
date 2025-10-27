// config/supabaseConfig.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://haanekzuyiwqrkdvbsqr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhYW5la3p1eWl3cXJrZHZic3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MTU5MTEsImV4cCI6MjA3NzA5MTkxMX0.CBUma_4T3K18YazlYmtgLwQzmLWW8QBm6lwBKRW62R4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
