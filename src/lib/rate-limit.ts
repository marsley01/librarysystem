import { createClient } from '@supabase/supabase-js';
import { RateLimitError } from './errors';

interface RateLimitConfig {
  interval: number;
  maxRequests: number;
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  default: { interval: 60, maxRequests: 30 },
  strict: { interval: 60, maxRequests: 10 },
  auth: { interval: 300, maxRequests: 5 },
  upload: { interval: 60, maxRequests: 6 },
};

export async function rateLimit(
  identifier: string,
  tier: keyof typeof DEFAULTS = 'default',
): Promise<void> {
  if (typeof window !== 'undefined') return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const config = DEFAULTS[tier];
  const now = new Date();

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('count, expires_at')
    .eq('identifier', identifier)
    .single();

  if (!existing || new Date(existing.expires_at) < now) {
    const expiresAt = new Date(now.getTime() + config.interval * 1000);
    await supabase
      .from('rate_limits')
      .upsert({ identifier, count: 1, expires_at: expiresAt.toISOString() })
      .eq('identifier', identifier);
    return;
  }

  if (existing.count >= config.maxRequests) {
    const retryAfter = Math.ceil(
      (new Date(existing.expires_at).getTime() - now.getTime()) / 1000,
    );
    throw new RateLimitError(Math.max(retryAfter, 1));
  }

  await supabase
    .from('rate_limits')
    .update({ count: existing.count + 1 })
    .eq('identifier', identifier);
}

export function getRateLimitIdentifier(request: Request, scope?: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const path = new URL(request.url).pathname;
  return `${ip}:${path}${scope ? `:${scope}` : ''}`;
}
