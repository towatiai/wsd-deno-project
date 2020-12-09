
export const authorization = async ({ request, response, session }, next) => {
    if (request.url.pathname.startsWith('/auth')
        || request.url.pathname.startsWith('/api')
        || request.url.pathname === "/") {

        // Request pathname is allowed
        await next();
        return;
    }

    if (session && await session.get('authenticated')) {

        // User is authorized to access the content 
        await next();
        return;
    }

    // User is not authorized, so (s)he is redirected
    response.redirect("/auth/login");
};


/**
 * Middleware, that fills rendering data with user information, if 
 * it's available in the current session.
 * @param {Objext} ctx Oak.context
 * @param {function} next Oak.next
 */
export const addUserData = async (ctx, next) => {

    if (ctx.hasOwnProperty("render")) {
        const render = ctx.render;
        const user = await ctx.session.get("user");

        ctx.render = (file, data = {}) => {
            data.__header = {
                user: user
            };

            render(file, data);
        }

    }

    await next();
}