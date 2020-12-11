import ReportController from "../../routes/controllers/reportController.js";
import { assertEquals, assert, assertThrowsAsync } from "../../deps.js";
import Mock, { mockRequest, type } from "../testUtils/mock.js";
import ReportService from "../../services/reportService.js";

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

const reportController = new ReportController(mockReportServiceClass, mockRunQuery.getMock());

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

// TESTS

Deno.test("When requested report page, renders 'reporting.ejs' with page data", async () => {
    // Arrange
    context.render.reset();
    context.session.get.reset();
    mockReportService.getReportByDate.reset();

    const email = "test@example.com";
    const user = {
        id: 1,
        email: email
    };

    const hasMorningReport = true;
    const hasEveningReport = false;

    context.session.get.withArgs("user").returns(user);
    mockReportService.getReportByDate.withArgs(user.id, type.ANY).returns([hasMorningReport, hasEveningReport]);

    // Act
    await reportController.getReportPage(mockContext);

    // Assert
    assert(context.render.calledWith("reporting.ejs", type.ANY));

    const pageData = context.render.getParams()[1];
    assertEquals(pageData.hasEveningReport, hasEveningReport);
    assertEquals(pageData.hasMorningReport, hasMorningReport);
});


Deno.test("Adds report successfully when given form with no errors", async () => {
    // Arrange
    context.render.reset();
    context.session.get.reset();
    context.response.redirect.reset();
    mockReportService.getReportByDate.reset();
    mockReportService.addReportForUser.reset();

    const email = "test@test.js";
    const form = {
        date: "2020-12-19",
        sleepTime: "2",
        sleepQuality: "5",
        mood: "5"
    };

    mockContext.request = mockRequest(form);
    mockContext.params = {type: "morning"}

    const user = {
        id: 1,
        email: email
    };
    context.session.get.withArgs("user").returns(user);

    mockReportService.getReportByDate.withArgs(user.id, type.ANY).returns([false, false]);

    // Act
    await reportController.addReport(mockContext);

    // Assert
    assert(context.session.get.calledWith("user"));
    assert(mockReportService.addReportForUser.calledWith(type.ANY, user));
    assert(context.render.calledTimes(1));
    assert(context.render.calledWith("reporting.ejs", type.ANY));

    const reportForm = mockReportService.addReportForUser.getParams()[0];

    assertEquals(reportForm.sleepTime, parseFloat(form.sleepTime));
    assertEquals(reportForm.sleepQuality, parseInt(form.sleepQuality));
    assertEquals(reportForm.mood, parseInt(form.mood));
});


Deno.test("Report isn't saved and form shows errors when submitting invalid report form", async () => {
    // Arrange
    context.render.reset();
    context.session.get.reset();
    context.response.redirect.reset();
    mockReportService.getReportByDate.reset();
    mockReportService.addReportForUser.reset();

    const email = "test@test.js";
    const form = {
        date: "invaliddate",
        sleepTime: "",
        sleepQuality: "6",
        mood: "5"
    };

    mockContext.request = mockRequest(form);
    mockContext.params = {type: "morning"}

    const user = {
        id: 1,
        email: email
    };
    context.session.get.withArgs("user").returns(user);

    mockReportService.getReportByDate.withArgs(user.id, type.ANY).returns([false, false]);

    // Act
    await reportController.addReport(mockContext);

    // Assert
    assert(mockReportService.addReportForUser.calledTimes(0));
    assert(context.render.calledTimes(1));
    assert(context.render.calledWith("reporting.ejs", type.ANY));

    const pageData = context.render.getParams()[1];
    assert(pageData.morningForm.errors.sleepTime.required);
    assert(pageData.morningForm.errors.sleepQuality.maxNumber);
    assert(pageData.morningForm.errors.date.isDate);
});

Deno.test("Throws error when trying to submit form without session", async () => {
    // Arrange
    context.render.reset();
    context.session.get.reset();
    context.response.redirect.reset();
    mockReportService.getReportByDate.reset();
    mockReportService.addReportForUser.reset();

    const form = {
        date: "invaliddate",
        sleepTime: "",
        sleepQuality: "6",
        mood: "5"
    };

    mockContext.request = mockRequest(form);
    mockContext.params = {type: "morning"}

    // Session has no user
    context.session.get.withArgs("user").returns(null);

    // Act

    // Assert
    assertThrowsAsync(reportController.addReport)
    assert(mockReportService.addReportForUser.calledTimes(0));
});