import UserService from "../../services/userService.js";
import { assertEquals, assert, assertThrowsAsync } from "../../deps.js";
import Mock, { type } from "../testUtils/mock.js";

const mockRunQuery = new Mock();
const mockBcrypt = {
    compare: new Mock(),
    hash: new Mock()
};
const userService = new UserService(mockRunQuery.getMock(), 
{
    compare: mockBcrypt.compare.getMock(), 
    hash: mockBcrypt.hash.getMock()
});

Deno.test("GetUserByEmail returns user when given an email", async () => {
    // Arrange
    mockRunQuery.reset();

    const email = "test@email.com";
    const user = {id: 1, email: email};
    mockRunQuery.withArgs(type.STRING, email).returns([user]);

    // Act
    const result = await userService.getUserByEmail(email);

    // Assert
    assert(mockRunQuery.calledTimes(1));
    assert(mockRunQuery.calledWith(type.STRING, email));
    assertEquals(result, [user]);
});

Deno.test("Logs user in when given correct password", async () => {
    // Arrange
    mockRunQuery.reset();
    mockBcrypt.compare.reset();

    const email = "test@email.com";
    const password = "superSecretPassword";
    const user = { id: 1, email, password };
    
    mockRunQuery.withArgs(type.STRING, email).returnsDatabaseResult([user]);
    mockBcrypt.compare.withArgs(password, password).returns(true);

    // Act
    const [authorized, userResult] = await userService.login(user);

    // Assert
    assert(mockRunQuery.calledTimes(1));
    assert(mockRunQuery.calledWith(type.STRING, email));
    assert(mockBcrypt.compare.calledWith(password, password));
    assertEquals(authorized, true);
    assertEquals(userResult, user);
});


Deno.test("Doesn't log user in when given wrong password", async () => {
    // Arrange
    mockRunQuery.reset();
    mockBcrypt.compare.reset();

    const email = "test@email.com";
    const password = "superSecretPassword";
    const wrongPassword = "wrongPassword";
    const user = { id: 1, email, password };
    
    mockRunQuery.withArgs(type.STRING, email).returnsDatabaseResult([user]);
    mockBcrypt.compare.withArgs(wrongPassword, password).returns(false);

    // Act
    const [authorized, userResult] = await userService.login({email, password: wrongPassword});

    // Assert
    assert(mockRunQuery.calledTimes(1));
    assert(mockRunQuery.calledWith(type.STRING, email));
    assert(mockBcrypt.compare.calledWith(wrongPassword, password));
    assertEquals(authorized, false);
    assertEquals(userResult, null);
});


Deno.test("Login fails if no email or password is given", async () => {
    // Arrange
    mockRunQuery.reset();

    // Act
    const [accepted, userResult] = await userService.login(null);

    // Assert
    assertEquals(userResult, null);
    assertEquals(accepted, false);
});


Deno.test("Registers user correctly and with hashed password", async () => {
    // Arrange
    mockRunQuery.reset();
    mockBcrypt.hash.reset();

    const email = "test@email.com";
    const password = "superSecretPassword";
    const hashedPassword = "hashedPassword";
    const user = { email, password };
    
    mockRunQuery.withArgs(type.STRING, email).returnsDatabaseResult([user]);
    mockBcrypt.hash.withArgs(password).returns(hashedPassword);

    // Act
    await userService.register(user);

    // Assert
    assert(mockRunQuery.calledTimes(1));
    assert(mockRunQuery.calledWith(type.STRING, email, hashedPassword), "Password should be hashed.");
    assert(mockBcrypt.hash.calledWith(password));
});

Deno.test("Throws error when trying to register with no user", async () => {
    // Arrange
    mockRunQuery.reset();
    
    // Act
    
    // Assert
    assert(mockRunQuery.calledTimes(0));
    assertThrowsAsync(userService.register);
});