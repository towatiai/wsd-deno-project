import UserController from "../../routes/controllers/userController.js";
import UserService from "../../services/userService.js";
import { assertEquals, assert, assertThrowsAsync } from "../../deps.js";
import Mock, { mockRequest, type } from "../testUtils/mock.js";

// SETUP
const mockRunQuery = new Mock();
const mockUserService = {
    login: new Mock(),
    register: new Mock(),
    getUserByEmail: new Mock()
};

function mockUserServiceClass() {
    return {
        login: mockUserService.login.getMock(),
        register: mockUserService.register.getMock(),
        getUserByEmail: mockUserService.getUserByEmail.getMock()
    };
}

const userController = new UserController(mockUserServiceClass, mockRunQuery.getMock());

const context = {
    render: new Mock(),
    response: {
        redirect: new Mock()
    },
    session: {
        set: new Mock()
    }
};

const mockContext = {
    render: context.render.getMock(),
    response: {
        redirect: context.response.redirect.getMock()
    },
    session: {set: context.session.set.getMock()}
}

// TESTS

Deno.test("When requested login page, renders 'login.ejs'", async () => {
    // Arrange
    context.render.reset();

    // Act
    await userController.loginPage(mockContext);

    // Assert
    assert(context.render.calledWith("login.ejs", type.ANY));
});

Deno.test("When requested register page, renders 'registration.ejs'", async () => {
    // Arrange
    context.render.reset();

    // Act
    await userController.registerPage(mockContext);

    // Assert
    assert(context.render.calledWith("registration.ejs", type.ANY));
});

Deno.test("Logs user in and redirects him/her to home page when given correct email and password", async () => {
    // Arrange
    context.render.reset();
    context.session.set.reset();
    context.response.redirect.reset();

    const email = "test@test.js";
    const password = "password";
    mockContext.request = mockRequest({
        email: email,
        password: password
    });

    const user = {
        id: 1,
        email: email
    };

    mockUserService.login.withArgs({email, password}).returns([true, user]);

    // Act
    await userController.login(mockContext);

    // Assert
    assert(context.response.redirect.calledWith("/"));
    assert(context.session.set.calledWith("authenticated", true));
    assert(mockUserService.login.calledWith({email, password}));
});

Deno.test("Doesn't log user in and keeps him/her on login page when given incorrect email and password", async () => {
    // Arrange
    context.render.reset();
    context.session.set.reset();
    context.response.redirect.reset();

    const email = "test@test.js";
    const password = "wrongPassword";
    mockContext.request = mockRequest({
        email: email,
        password: password
    });

    const user = {
        id: 1,
        email: email
    };

    mockUserService.login.withArgs({email, password}).returns([false, user]);

    // Act
    await userController.login(mockContext);

    // Assert
    assert(context.response.redirect.calledTimes(0));
    assert(context.session.set.calledTimes(0));
    assert(mockUserService.login.calledWith({email, password}));
    assert(context.render.calledTimes(1));
    assert(context.render.calledWith("login.ejs", type.ANY));

    const pageData = context.render.getParams()[1];

    assertEquals(pageData.errors.login, "Invalid username or password.");
});

Deno.test("Sets session correctly when logging user out", async () => {
    // Arrange
    context.render.reset();
    context.session.set.reset();
    context.response.redirect.reset();

    // Act
    await userController.logout(mockContext);

    // Assert
    assert(context.response.redirect.calledWith("/"));
    assert(context.session.set.calledTimes(2));
    assert(context.session.set.calledWith("authenticated", false));
    assert(context.session.set.calledWith("user", null));
});



Deno.test("Registers user when given correct information", async () => {
    // Arrange
    context.render.reset();
    context.session.set.reset();
    context.response.redirect.reset();

    const email = "test@test.js";
    const password = "password";
    mockContext.request = mockRequest({
        email: email,
        password: password,
        passwordVerify: password
    });

    const user = { email, password };

    // No existing user with email
    mockUserService.getUserByEmail.withArgs(email).returnsDatabaseResult([]);

    // Act
    await userController.register(mockContext);

    // Assert
    assert(mockUserService.register.calledWith(user));
    assert(mockUserService.getUserByEmail.calledWith(email));
    assert(context.render.calledTimes(1));
    assert(context.render.calledWith("registration.ejs", type.ANY));

    const pageData = context.render.getParams()[1];

    assertEquals(pageData.registerSuccess, true);
});

Deno.test("Registration notifies user if email is reserved", async () => {
    // Arrange
    context.render.reset();
    context.session.set.reset();
    context.response.redirect.reset();
    mockUserService.getUserByEmail.reset();
    mockUserService.register.reset();

    const email = "test@test.js";
    const password = "password";
    mockContext.request = mockRequest({
        email: email,
        password: password,
        passwordVerify: password
    });


    // Existing user
    mockUserService.getUserByEmail.withArgs(email).returnsDatabaseResult([{id: 2}]);

    // Act
    await userController.register(mockContext);

    // Assert
    assert(mockUserService.register.calledTimes(0));
    assert(context.render.calledTimes(1));
    assert(context.render.calledWith("registration.ejs", type.ANY));

    const pageData = context.render.getParams()[1];

    assertEquals(pageData.registerSuccess, false);
    assert(pageData.errors.email);
});

Deno.test("Registration notifies user if password verification fails", async () => {
    // Arrange
    context.render.reset();
    context.session.set.reset();
    context.response.redirect.reset();
    mockUserService.getUserByEmail.reset();
    mockUserService.register.reset();

    const email = "test@test.js";
    const password = "password";
    mockContext.request = mockRequest({
        email: email,
        password: password,
        passwordVerify: "notcorrect"
    });

    const user = { email, password };

    mockUserService.getUserByEmail.withArgs(email).returnsDatabaseResult([]);

    // Act
    await userController.register(mockContext);

    // Assert
    assert(mockUserService.register.calledTimes(0));
    assert(context.render.calledTimes(1));
    assert(context.render.calledWith("registration.ejs", type.ANY));

    const pageData = context.render.getParams()[1];

    assertEquals(pageData.registerSuccess, false);
    assert(pageData.errors.passwordVerify);
});