
export const authorization = async ({ request, response, session }, next) => {
    if (!request.url.pathname.startsWith('/auth') || !request.url.pathname === "/") {
        if (session && await session.get('authenticated')) {
            await next();
        } else {
            response.redirect("/auth/login");
        }
    } else {
        await next();
    }
};


/**
 * Middleware, that fills rendering data with user information, if 
 * it's available in the current session.
 * @param {Objext} ctx Oak.context
 * @param {function} next Oak.next
 */
export const addUserData = async( ctx, next ) => {

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