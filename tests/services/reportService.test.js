import ReportService from "../../services/reportService.js";
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

Deno.test("Gets general report when given a date", async () => {
    // Arrange
    mockRunQuery.reset();
    const date = new Date();
    const testdata = [{
        avg_sleep_time: 1
    }];

    mockRunQuery.withArgs(type.STRING, type.ANY).returnsDatabaseResult(testdata);

    // Act
    const result = await reportService.getGeneralReportSummaryByDate(date);

    // Assert
    assert(mockRunQuery.calledTimes(1));
    assert(mockRunQuery.calledWith(type.STRING, type.ANY));
    assertEquals(result, testdata[0]);
});

Deno.test("Gets general report for past seven days when given no parameters", async () => {
    // Arrange
    mockRunQuery.reset();
    const testdata = [{
        avg_sleep_time: 1
    }];

    mockRunQuery.withArgs(type.STRING).returnsDatabaseResult(testdata);

    // Act
    const result = await reportService.getGeneralReportSummaryForPastSevenDays();

    // Assert
    assert(mockRunQuery.calledTimes(1));
    assert(mockRunQuery.calledWith(type.STRING));
    assertEquals(result, testdata[0]);
});

Deno.test("Gets report summary for a week when given user id and week number", async () => {
    // Arrange
    mockRunQuery.reset();
    const weekNumber = 34;
    const userId = 1;
    const testdata = [{
        avg_sleep_time: 1
    }];

    mockRunQuery.withArgs(type.STRING, userId, weekNumber).returnsDatabaseResult(testdata);

    // Act
    const result = await reportService.getReportSummaryForWeek(userId, weekNumber);

    // Assert
    assert(mockRunQuery.calledTimes(1));
    assert(mockRunQuery.calledWith(type.STRING, userId, weekNumber));
    assertEquals(result, testdata[0]);
});

Deno.test("Gets report summary for a month when given user id and month as a number", async () => {
    // Arrange
    mockRunQuery.reset();
    const month = 5;
    const userId = 1;
    const testdata = [{
        avg_sleep_time: 1
    }];

    mockRunQuery.withArgs(type.STRING, userId, month).returnsDatabaseResult(testdata);

    // Act
    const result = await reportService.getReportSummaryForMonth(userId, month);

    // Assert
    assert(mockRunQuery.calledTimes(1));
    assert(mockRunQuery.calledWith(type.STRING, userId, month));
    assertEquals(result, testdata[0]);
});

Deno.test("Gets mood summary for past two days when given user id", async () => {
    // Arrange
    mockRunQuery.reset();
    const userId = 1;
    const testdata = [{
        "sleep_time": 10
    }];

    mockRunQuery.withArgs(type.STRING, userId, type.ANY, type.ANY).returnsDatabaseResult(testdata);

    // Act
    const result = await reportService.getMoodSummaryForPastTwoDays(userId);

    // Assert
    assert(mockRunQuery.calledTimes(1));
    assert(mockRunQuery.calledWith(type.STRING, userId, type.ANY, type.ANY));
    assertEquals(result, testdata);
});

Deno.test("Adds morning report after checking that previous report doesn't exist", async () => {
    // Arrange
    mockRunQuery.reset();
    const user = {
        id: 8
    };
    const date = new Date();
    const report = {
        sleepTime: 1,
        sleepQuality: 2,
        mood: 3,
        date: date,
    };

    const previousReports = [{sports_time: 2}];

    mockRunQuery.withArgs(type.STRING, user.id, type.ANY).returnsDatabaseResult(previousReports);

    // Act
    await reportService.addReportForUser(report, user);

    // Assert
    assert(mockRunQuery.calledTimes(2));

    // Verifies that the function checks if there is previous reports
    assert(mockRunQuery.calledWith(type.STRING, user.id, type.ANY));

    // Verifies that the new report was added.
    assert(mockRunQuery.calledWith(type.STRING, report.sleepTime, report.sleepQuality, report.mood, type.ANY, user.id));
});

Deno.test("Adds evening report after checking that previous report doesn't exist", async () => {
    // Arrange
    mockRunQuery.reset();
    const user = {
        id: 8
    };
    const date = new Date();
    const report = {
        sportsTime: 2,
        studyingTime: 4,
        eatingQuality: 5,
        mood: 3,
        date: date,
    };

    const previousReports = [{sleep_time: 2}];

    mockRunQuery.withArgs(type.STRING, user.id, type.ANY).returnsDatabaseResult(previousReports);

    // Act
    await reportService.addReportForUser(report, user);

    // Assert
    assert(mockRunQuery.calledTimes(2));
    
    // Verifies that the function checks if there is previous reports
    assert(mockRunQuery.calledWith(type.STRING, user.id, type.ANY));

    // Verifies that the new report was added.
    assert(mockRunQuery.calledWith(type.STRING, 
        report.sportsTime, report.studyingTime, report.eatingQuality, report.mood, type.ANY, 
        user.id));
});

Deno.test("When adding new evening report, deletes old evening report for same day.", async () => {
    // Arrange
    mockRunQuery.reset();
    const user = {
        id: 8
    };
    const date = new Date();
    const report = {
        sportsTime: 2,
        studyingTime: 4,
        eatingQuality: 5,
        mood: 3,
        date: date,
    };

    const previousReports = [{id: 987, sports_time: 2}];

    mockRunQuery.withArgs(type.STRING, user.id, type.ANY).returnsDatabaseResult(previousReports);

    // Act
    await reportService.addReportForUser(report, user);

    // Assert
    assert(mockRunQuery.calledTimes(3));
    
    // Verifies that the function checks if there is previous reports
    assert(mockRunQuery.calledWith(type.STRING, user.id, type.ANY));

    // Verifies that the function deletes the old report
    assert(mockRunQuery.calledWith(type.STRING, previousReports[0].id, user.id));
});

Deno.test("When adding new morning report, deletes old morning report for same day.", async () => {
    // Arrange
    mockRunQuery.reset();
    const user = {
        id: 8
    };
    const date = new Date();
    const report = {
        sleepTime: 1,
        sleepQuality: 2,
        mood: 3,
        date: date,
    };

    const previousReports = [{id: 987, sleep_time: 2}];

    mockRunQuery.withArgs(type.STRING, user.id, type.ANY).returnsDatabaseResult(previousReports);

    // Act
    await reportService.addReportForUser(report, user);

    // Assert
    assert(mockRunQuery.calledTimes(3));
    
    // Verifies that the function checks if there is previous reports
    assert(mockRunQuery.calledWith(type.STRING, user.id, type.ANY));

    // Verifies that the function deletes the old report
    assert(mockRunQuery.calledWith(type.STRING, previousReports[0].id, user.id));
});