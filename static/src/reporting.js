
let iterator = 0;

function createSlider(divId, inputId) {

    const valueEl = $("<div></div>")
        .attr("id", `divId_value_${iterator}`)
        .attr("style", "width: 50px; text-align: center;");

    const sliderEl = $(`#${divId}`);
    const inputEl = $(`#${inputId}`);

    sliderEl.slider({
        value: inputEl.val() ?? 1,
        min: 1,
        max: 5,
        slide: (e, ui) => {
            setTimeout(() => {
                $(valueEl).html(ui.value).position({
                    my: 'center bottom',
                    at: 'center top',
                    of: ui.handle,
                    offset: "0, 15"
                });
            }, 5);
        },
        change: (e, ui) => {
            inputEl.val(ui.value);
        }
    });

    valueEl.insertBefore(sliderEl);
    valueEl.html(sliderEl.slider("values", 0)).position({
        my: 'center bottom',
        at: 'center top',
        of: $(`#${divId} span:eq(0)`),
        offset: "0, 15"
    });


    if (!inputEl.val()) {
        inputEl.val(1);
    }

    iterator++;
}


function createDatepicker(id) {

    const dateFormat = "yy-mm-dd";

    const datepicker = $(`#${id}`);
    datepicker.datepicker({
        dateFormat: dateFormat
    });

    // Because date formats...
    const formatted = $.datepicker.formatDate(dateFormat, new Date(datepicker.val()));
    datepicker.datepicker("setDate", formatted);
}


$(() => {
    
    createDatepicker("morningDate");
    
    createSlider("sleep-quality-slider", "sleep-quality-value");
    createSlider("morning-mood-slider", "morning-mood-value");
    
})