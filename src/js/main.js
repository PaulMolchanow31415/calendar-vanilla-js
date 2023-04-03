import '../scss/main.scss';
import Calendar from "./mylib/calendar.js";

const superEmbeddedInsertableCustomizableReusableCalendar = new Calendar(".calendar__display", {
    nav: {
        prevBtn: "#calendar-prev-btn",
        nextBtn: "#calendar-next-btn"
    },
    sender: {
        api: "https://test.com/api/v1/dates",
        logs: true,
    },
    confirmSettings: {
        message: "Отправить?",
        errorMessage: "Ничего не выбрано",
        json: true
    },
    intervalViewers: {
        displayMin: "#calendar__min-interval",
        displayMax: "#calendar__max-interval",
    },
    fullDateDisplaySelector: ".calendar__full-date",
    dateDescriptionSelector: ".calendar__top",
    displayCurrentDateSelector: ".calendar__current-date-btn",
    submitBtnSelector: ".calendar__accept-btn",
    dateChooserSelector: ".calendar__choose-btn",
    // mode: 'dayNames',
    // firstDayOfWeek: 1,
    // format: 'DDD DD MMM YYYY',
    // locale: "en-US",
    // defaultDate: new Date(7),
});

console.log(superEmbeddedInsertableCustomizableReusableCalendar);
