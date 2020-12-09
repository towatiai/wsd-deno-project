const update = async (week, month) => {

    const response = await fetch("/api/summary", {
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify({
            week: week,
            month: month
        })
    });

    const summary = await response.json();

    if (summary.week) {
        Object.keys(summary.week).forEach(key => {
            const value = summary.week[key]
                ? parseFloat(summary.week[key]).toFixed(1)
                : "No data";
            $(`#${key}-week`).text(value);
        });    
    }
    
    if (summary.month) {
        Object.keys(summary.month).forEach(key => {
            const value = summary.month[key]
                ? parseFloat(summary.month[key]).toFixed(1)
                : "No data";
            $(`#${key}-month`).text(value);
        });    
    }
    
}


// On load
$(async () => {

    const weekSelect = $("#week-select");
    const monthSelect = $("#month-select");

    const today = new Date();
    const month = today.getMonth() + 1;
    const week = $.datepicker.iso8601Week(today); // I hate dates
    
    monthSelect.val(month);
    weekSelect.val(week);

    weekSelect.change((e) => {
        update(e.target.value, null);
    });

    monthSelect.change((e) => {
        update(null, e.target.value);
    });


    await update(week, month);

});