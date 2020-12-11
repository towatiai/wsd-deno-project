import { 
    Application, 
    viewEngine, 
    engineFactory, 
    adapterFactory,
    Session,
    config
} from "./deps.js";
import Router from "./routes/routes.js";
import * as middleware from './middlewares/middlewares.js';
import { addUserData, authorization } from './middlewares/authorization.js';
import { createQueryRunner } from "./database/runQuery.js";

const app = new Application();

const session = new Session({framework: "oak"});
await session.init();

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();
app.use(viewEngine(oakAdapter, ejsEngine, {
    viewRoot: "./views",
    useCache: false
}));

app.use(session.use()(session));

app.use(middleware.errorMiddleware);
app.use(middleware.requestTimingMiddleware);
app.use(middleware.serveStaticFilesMiddleware);

app.use(authorization);
app.use(addUserData);

let databaseUrl = Deno.env.toObject().DATABASE_URL;
if (typeof databaseUrl === "undefined") {
    databaseUrl = config().DATABASE_URL;
}

const router = new Router(createQueryRunner(databaseUrl, 5));

app.use(router.getRoutes());
 
let port = Deno.args[Deno.args.length - 1] ?? 7777;
app.listen({ port: Number(port) });


export default app;