import { NextResponse } from 'next/server';
import { rateLimit, getRateLimitIdentifier } from './rate-limit';
import { errorResponse, RateLimitError } from './errors';

type Handler = (request: Request, context?: any) => Promise<NextResponse>;

interface RouteOptions {
  rateLimit?: 'default' | 'strict' | 'auth' | 'upload' | false;
  auth?: boolean;
}

export function createRouteHandler(handler: Handler, options: RouteOptions = {}) {
  return async (request: Request, context?: any) => {
    try {
      if (options.rateLimit !== false) {
        const tier = options.rateLimit || 'default';
        const identifier = getRateLimitIdentifier(request, tier);
        await rateLimit(identifier, tier);
      }

      return await handler(request, context);
    } catch (error) {
      if (error instanceof RateLimitError) {
        const resp = errorResponse(error);
        return NextResponse.json(resp.body, {
          status: resp.status,
          headers: resp.headers as Record<string, string>,
        });
      }
      const resp = errorResponse(error);
      return NextResponse.json(resp.body, { status: resp.status });
    }
  };
}

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function okResponse(data?: unknown) {
  return NextResponse.json(data ?? { success: true });
}
