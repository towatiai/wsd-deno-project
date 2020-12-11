import UserController from "../../routes/controllers/userController.js";
import { assertEquals, assert, assertThrowsAsync } from "../../deps.js";
import Mock, { type } from "../testUtils/mock.js";

const mockRunQuery = new Mock();
const reportService = new ReportService(mockRunQuery.getMock());

Deno.test("Gets report when given user id and date", async () => {
    // Arrange
    mockRunQuery.reset();
    const date = new Date();
    const result = [{
        sleep_time: 1
    }, {
        sports_time: 2
    }];

    const userId = 1;

    mockRunQuery.withArgs(type.STRING, userId, type.ANY).returnsDatabaseResult(result);

    // Act
    const [morning, evening] = await reportService.getReportByDate(userId, date);

    // Assert
    assert(mockRunQuery.calledTimes(1));
    assert(mockRunQuery.calledWith(type.STRING, userId, type.ANY));
    assertEquals(morning, result[0]);
    assertEquals(evening, result[1]);
});