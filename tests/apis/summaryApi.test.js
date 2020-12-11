import { assertEquals, assert, assertThrowsAsync } from "../../deps.js";
import Mock, { mockRequest, type } from "../testUtils/mock.js";
import ReportService from "../../services/reportService.js";
import SummaryApi from "../../routes/apis/summaryApi.js";

// SETUP
const mockRunQuery = new Mock();

const mockReportService = {};
Object.getOwnPropertyNames(new ReportService).forEach(prop => {
    const mock = new Mock();
    mockReportService[prop] = mock;
});

function mockReportServiceClass() {
    const serviceClass = {};
    Object.keys(mockReportService).forEach(key => serviceClass[key] = mockReportService[key].getMock())
    return serviceClass;
}

const summaryApi = new SummaryApi(mockReportServiceClass, mockRunQuery);

const context = {
    render: new Mock(),
    response: {
        redirect: new Mock()
    },
    session: {
        set: new Mock(),
        get: new Mock()
    }
};

const mockContext = {
    render: context.render.getMock(),
    response: {
        redirect: context.response.redirect.getMock()
    },
    session: {
        set: context.session.set.getMock(),
        get: context.session.get.getMock()
    }
}

Deno.test("Gets summary for user when given week and month", async () => {
    // Arrange
    context.session.get.reset();
    mockReportService.getReportSummaryForWeek.reset();
    mockReportService.getReportSummaryForMonth.reset();

    const email = "test@test.js";
    const params = {
        week: "51",
        month: "12"
    };

    mockContext.request = mockRequest(params);

    const user = {
        id: 1,
        email: email
    };
    context.session.get.withArgs("user").returns(user);

    const weekSummary = {
        avg_sleep_time: 9.2
    };
    const monthSummary = {
        avg_sleep_time: 7.6
    };
    mockReportService.getReportSummaryForWeek.withArgs(user.id, params.week).returns(weekSummary);
    mockReportService.getReportSummaryForMonth.withArgs(user.id, params.month).returns(monthSummary);

    // Act
    await summaryApi.getSummaryByWeekAndMonth(mockContext);

    // Assert
    assert(context.session.get.calledWith("user"));
    assert(mockReportService.getReportSummaryForMonth.calledWith(user.id, params.month));
    assert(mockReportService.getReportSummaryForWeek.calledWith(user.id, params.week));
    assertEquals(mockContext.response.body.week, weekSummary);
    assertEquals(mockContext.response.body.month, monthSummary);
});

Deno.test("General summary for date returns data without requiring a session", async () => {
    // Arrange
    context.session.get.reset();
    mockReportService.getGeneralReportSummaryForPastSevenDays.reset();

    mockContext.params = {
        day: 3,
        month: 5,
        year: 2020
    };

    const date = new Date(2020, 4, 3);

    // Act
    await summaryApi.getGeneralSummaryByDate(mockContext);

    // Assert
    assert(context.session.get.calledTimes(0));
    assert(mockReportService.getGeneralReportSummaryByDate.calledTimes(1));
    assert(mockReportService.getGeneralReportSummaryByDate.calledWith(date));
});

Deno.test("General summary returns data without requiring a session", async () => {
    // Arrange
    context.session.get.reset();
    mockReportService.getGeneralReportSummaryForPastSevenDays.reset();

    // Act
    await summaryApi.getGeneralSummary(mockContext);

    // Assert
    assert(context.session.get.calledTimes(0));
    assert(mockReportService.getGeneralReportSummaryForPastSevenDays.calledTimes(1));
});