import { send } from '../deps.js';
import debug from "../utils/debug.js";

const errorMiddleware = async(context, next) => {
  try {
    await next();
  } catch (e) {
    console.log(e);
  }
}

const requestTimingMiddleware = async({ request, session }, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  const user = await session.get("user");
  debug("LOG", "Request timing", `${request.method} ${request.url.pathname} - ${ms} ms`, `User: ${user?.id ?? "anonymous"}`);
}

const serveStaticFilesMiddleware = async(context, next) => {
  if (context.request.url.pathname.startsWith('/static')) {
    const path = context.request.url.pathname.substring(7);
  
    debug("LOG", "Serving static file", path);

    await send(context, path, {
      root: `${Deno.cwd()}/static`
    });
  
  } else {
    await next();
  }
}

export { errorMiddleware, requestTimingMiddleware, serveStaticFilesMiddleware };