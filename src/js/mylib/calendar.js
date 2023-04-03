import DateUtil from "./utils/dateUtil.js";
import DayNamesDisplay from "./controller/dayNamesDisplay.js";
import CalendarCells from "./controller/calendarCells.js";
import Client from "./modules/client.js";
import formatDate from "./utils/dateFormatter.js";

class Calendar {
    #calendarGrid;
    #submitBtn;
    #dayNamesDisplay;
    #fullDateDisplay;
    #dateDescriptionDisplay;
    #currentDateBtn;
    #dateChooserBtn;
    #calendarCells;
    #navigation;
    #sender;
    #confirmSettings;
    #intervalViewers;
    #format;
    #mode;
    #dateUtil;
    #firstDayOfWeek;
    selectedDay;
    selectedMonth;
    selectedYear;
    #firstSelectedDate;
    #defaultDate;
    #secondSelectedDate;
    #isDateChooserClicked = false;
    days = {prevMonthDays: [], monthDays: [], nextMonthDays: []};

    /**
     * @param gridSelector принимает значение селектора-оболочки таблицы календаря
     * @param nav - кнопки для управления "листами" календаря
     * @param sender - клиент для отправки данных logs: true - выводит сообщения в консоль
     * @param confirmSettings - настройки выводов, оповещающих об отправке данных isShow: true - опрашивает пользователя
     * @param submitBtnSelector - кнопка для отправки json интервала дат
     * @param intervalViewers - отображение минимальной и максимальной даты
     * @param dateDescriptionSelector - место для вывода названий (дней недели, месяцев)
     * @param displayCurrentDateSelector - показывает текущую дату в locale формате
     * @param fullDateDisplaySelector
     * @param dateChooserSelector
     * @param locale - локализация
     * @param defaultDate - дата, которая будет установлена по умолчанию
     * @param firstDayOfWeek - понедельник по умолчанию
     * @param format - формат вывода даты
     * @param mode - год, месяц или день
     * */
    constructor(gridSelector, {
        nav, sender, confirmSettings,
        submitBtnSelector, intervalViewers,
        dateDescriptionSelector, displayCurrentDateSelector, fullDateDisplaySelector, dateChooserSelector,
        locale, defaultDate = new Date(),
        firstDayOfWeek = 1, format = 'yyyy.MM.dd', mode = 'days'
    }) {
        this.#dateUtil = new DateUtil(locale, firstDayOfWeek);
        this.#calendarGrid = document.querySelector(gridSelector);
        this.#submitBtn = document.querySelector(submitBtnSelector);
        this.#dateDescriptionDisplay = document.querySelector(dateDescriptionSelector);
        this.#currentDateBtn = document.querySelector(displayCurrentDateSelector);
        this.#fullDateDisplay = document.querySelector(fullDateDisplaySelector);
        this.#dateChooserBtn = document.querySelector(dateChooserSelector);
        this.#calendarCells = new CalendarCells(this.#calendarGrid);
        this.#dayNamesDisplay = new DayNamesDisplay(this.#dateDescriptionDisplay);
        this.#sender = new Client({
            api: sender.api,
            logs: sender?.logs ?? false,
        });
        this.#navigation = {
            prevBtn: document.querySelector(nav.prevBtn),
            nextBtn: document.querySelector(nav.nextBtn),
        };
        this.#intervalViewers = {
            displayMin: document.querySelector(intervalViewers.displayMin),
            displayMax: document.querySelector(intervalViewers.displayMax),
        };
        this.#confirmSettings = {
            message: confirmSettings?.message ?? "Do you want to send?",
            errorMessage: confirmSettings?.errorMessage ?? "Nothing is selected",
            json: confirmSettings?.json ?? false
        };
        this.#defaultDate = defaultDate;
        this.#firstDayOfWeek = firstDayOfWeek;
        this.#format = format;
        this.#mode = mode;

        this.#init();
    }

    #init() {
        this.#selectMonth();
        this.#initDays();
        this.#fillCells();
        this.#handleEvents();
    }

    #selectMonth() {
        this.selectedDay = this.#dateUtil.createDate(this.#defaultDate);
        this.selectedYear = this.#dateUtil.createYear(this.selectedDay.date);
        this.selectedMonth = this.#dateUtil.createMonth(
            new Date(this.selectedYear.year, this.selectedDay.monthIndex)
        );
    }

    #initDays() {
        const monthDays = this.selectedMonth.createMonthDays();
        const monthDaysCount = DateUtil.getCountDaysInMonth(this.selectedMonth.monthIndex, this.selectedYear.year);
        const prevMonthDays = this.#dateUtil.createMonth(
            new Date(this.selectedYear.year, this.selectedMonth.monthIndex - 1
            )).createMonthDays();
        const nextMonthDays = this.#dateUtil.createMonth(
            new Date(this.selectedYear.year, this.selectedMonth.monthIndex + 1
            )).createMonthDays();

        const firstDay = monthDays[0];
        const lastDay = monthDays[monthDaysCount - 1];
        const shiftIndex = this.#firstDayOfWeek - 1;

        const countOfPrevDays =
            firstDay.dayNumberInWeek - 1 - shiftIndex < 0
                ? DateUtil.COUNT_DAYS_IN_WEEK - (this.#firstDayOfWeek - firstDay.dayNumberInWeek)
                : firstDay.dayNumberInWeek - 1 - shiftIndex;

        const countOfNextDays =
            DateUtil.COUNT_DAYS_IN_WEEK - lastDay.dayNumberInWeek + shiftIndex > 6
                ? DateUtil.COUNT_DAYS_IN_WEEK - lastDay.dayNumberInWeek - (DateUtil.COUNT_DAYS_IN_WEEK - shiftIndex)
                : DateUtil.COUNT_DAYS_IN_WEEK - lastDay.dayNumberInWeek + shiftIndex;

        this.days.prevMonthDays = [];
        this.days.monthDays = [];
        this.days.nextMonthDays = [];

        for (let i = 0; i < countOfPrevDays; i++) {
            this.days.prevMonthDays[i] = prevMonthDays[prevMonthDays.length - (countOfPrevDays - i)];
        }
        for (let j = 0; j < monthDays.length; j++) {
            this.days.monthDays[j] = monthDays[j];
        }
        for (let k = 0; k < countOfNextDays; k++) {
            this.days.nextMonthDays[k] = nextMonthDays[k];
        }
    }

    #fillCells() {
        const currentYear = new Date().getFullYear();
        this.#fullDateDisplay.innerText
            = formatDate(this.selectedDay.date, this.#format);

        if (currentYear === this.selectedYear.year) {
            this.#currentDateBtn.dataset.year = "current";
        } else {
            this.#currentDateBtn.removeAttribute("data-year");
        }

        if (this.#mode === 'days') {
            this.#dayNamesDisplay.fill(this.#dateUtil.dayNames);
            this.#currentDateBtn.innerText
                = this.selectedYear.year + ' ' + this.#dateUtil.monthNames.at(this.selectedMonth.monthIndex).month;
            this.#calendarCells.updateDays(this.days);
        } else if (this.#mode === 'months') {
            this.#dayNamesDisplay.flush();
            this.#currentDateBtn.innerText = this.selectedYear.year;
            this.#calendarCells.updateMonths(this.#dateUtil.monthNames);
        }
    }

    #handleEvents() {
        this.#navigation.prevBtn.addEventListener("click", () => this.onClickArrow('prev'));

        this.#navigation.nextBtn.addEventListener("click", () => this.onClickArrow('next'));

        this.#dateChooserBtn.addEventListener("click", this.onClickChooseBtn);

        this.#calendarGrid.addEventListener("click", e => this.onClickGrid(e));

        this.#submitBtn.addEventListener("click", this.onSubmitInterval);
    }

    onClickArrow(direction) {
        if (this.#mode === 'days') {
            this.#switchMonth(direction);
            this.#initDays();
        }

        this.#fillCells();
    }

    #switchMonth(direction) {
        direction === 'prev' ? --this.selectedMonth.monthIndex : ++this.selectedMonth.monthIndex;

        if (this.selectedMonth.monthIndex === -1) {
            this.selectedMonth = this.#dateUtil.createMonth(
                new Date(--this.selectedYear.year, DateUtil.COUNT_MOTHS_IN_YEAR - 1)
            );
        } else if (this.selectedMonth.monthIndex === DateUtil.COUNT_MOTHS_IN_YEAR) {
            this.selectedMonth = this.#dateUtil.createMonth(
                new Date(++this.selectedYear.year, 0)
            );
        } else {
            this.selectedMonth = this.#dateUtil.createMonth(
                new Date(this.selectedYear.year, this.selectedMonth.monthIndex)
            );
        }
    }

    onClickChooseBtn = () => {
        if (this.#mode !== "months") {
            this.#isDateChooserClicked = !this.#isDateChooserClicked;
            this.#dateChooserBtn.classList.toggle("active");
            this.#calendarCells.updateDays(this.days);
        }
    }

    onClickGrid(e) {
        e = e || event;
        const target = e.target || e.srcElement;

        if (target.hasAttribute("data-time") && this.#isDateChooserClicked) {
            this.onSelectDay(new Date(target.dataset.time));
        }
    }

    onSelectDay(date) {
        if (!this.#firstSelectedDate) {
            this.#firstSelectedDate = date;
            this.#calendarCells.selectFirstDay(date);
            this.#intervalViewers.displayMin.innerText = formatDate(date, this.#format);
            return;
        }
        if (!this.#secondSelectedDate) {
            this.#secondSelectedDate = date;
            this.#calendarCells.selectSecondDay(date);
            this.#intervalViewers.displayMax.innerText =
                DateUtil.isEqualsTime(this.#firstSelectedDate, this.#secondSelectedDate) ?
                    '' : formatDate(date, this.#format);
            return;
        }
        if (this.#firstSelectedDate && this.#secondSelectedDate) {
            this.#calendarCells.updateDays(this.days);
            this.#flushDisplays();
        }
    }

    onSubmitInterval = () => {
        let min, max, compared, intervalsData = [], response;

        if (!this.#firstSelectedDate) {
            alert(this.#confirmSettings.errorMessage);
            return;
        } else if (!this.#secondSelectedDate) {
            intervalsData = [this.#firstSelectedDate];
        } else {
            compared = DateUtil.compare(this.#firstSelectedDate, this.#secondSelectedDate);
            min = compared.min;
            max = compared.max;
        }

        while (min <= max) {
            intervalsData.push(new Date(min));
            min.setDate(min.getDate() + 1);
        }

        if (confirm(this.#confirmSettings.message)) {
            response = this.#sender.send({
                countOfDays: intervalsData.length,
                days: intervalsData.map(e => formatDate(e, this.#format))
            });
            this.#confirmSettings.json ? alert('JSON: ' + response) : false;
        }

        this.#calendarCells.updateDays(this.days);
        this.#flushDisplays();
    }

    #flushDisplays() {
        this.#intervalViewers.displayMin.innerText = '';
        this.#intervalViewers.displayMax.innerText = '';
        this.#firstSelectedDate = undefined;
        this.#secondSelectedDate = undefined;
    }
}

export default Calendar;


/*

this.#currentDateBtn.addEventListener("click", this.onChangeMode)

if (target.hasAttribute("data-month")) {
            this.onSelectMonth(new Date(target.dataset.month));
        }

onChangeMode = () => {
        this.#switchMode();
        this.#fillCells();
    }

    #switchMode() {
        this.#mode = this.#mode === 'days' ? 'months' : 'days';
    }

onSelectMonth(date) {
        this.#switchMode();
        this.selectedMonth = this.#dateUtil.createMonth(
            new Date(this.selectedYear.year, date.getMonth())
        );
        this.#initDays();
        this.#fillCells();
    }

if (this.#mode === 'months') {
            this.#switchYear(direction);
            this.#initMonths();
        }

#switchYear(direction) {
        direction === 'prev' ? --this.selectedYear.year : ++this.selectedYear.year;
        // todo update month names
        this.selectedYear = this.#dateUtil.createYear(
            new Date(this.selectedYear.year), this.selectedMonth.monthIndex
        )
        // fixme
        console.log('monthNames', this.#dateUtil.monthNames)
    }

#initMonths() {
    const yearMonths = this.selectedYear.createMonths();
    const countOfMonths = DateUtil.COUNT_MOTHS_IN_YEAR * (new Date().getFullYear()) -
        this.months

    console.log(this.#dateUtil.monthNames)
}*/
