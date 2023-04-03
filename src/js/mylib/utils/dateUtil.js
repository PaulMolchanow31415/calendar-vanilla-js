class DateUtil {
    static get MILLS_IN_DAY() {
        return 86400000;
    }

    static get COUNT_DAYS_IN_WEEK() {
        return 7;
    }

    static get COUNT_MOTHS_IN_YEAR() {
        return 12;
    }

    /**
     * Названия могут меняться в зависимасти от выбранного языка
     **/
    monthNames = [];
    dayNames = [];
    locale;

    constructor(locale, firstDayOfWeek) {
        this.locale = locale ?? "default";
        this.updateDayNames(firstDayOfWeek);
        this.updateMonthNames();
    }

    updateDayNames(firstDayOfWeek) {
        this.dayNames = this.getDayNames(firstDayOfWeek);
    }

    updateMonthNames() {
        this.monthNames = this.getMonthNames();
    }

    createDate(otherDate) {
        const date = otherDate ?? new Date();
        const day = date.toLocaleDateString(this.locale, {weekday: "long"});
        const dayNumber = date.getDate();
        const dayNumberInWeek = date.getDay();
        const dayShort = date.toLocaleDateString(this.locale, {weekday: "short"});
        const month = date.toLocaleDateString(this.locale, {month: "long"});
        const monthIndex = date.getMonth();
        const monthNumber = monthIndex + 1;
        const monthShort = date.toLocaleDateString(this.locale, {month: "short"});
        const timestamp = date.getTime();
        const week = DateUtil.getNumberOfWeek(date);
        const year = date.getFullYear();
        const yearShort = date.toLocaleDateString(this.locale, {year: "2-digit"});

        return {
            date, day, dayNumber, dayNumberInWeek, dayShort, month,
            monthIndex, monthNumber, monthShort, timestamp, week,
            year, yearShort
        };
    }

    createMonth(selectedDate) {
        const {monthIndex, monthNumber, year} = this.createDate(selectedDate);
        const getDay = dayNumber => this.createDate(new Date(year, monthIndex, dayNumber));
        const createMonthDays = () => {
            const days = [];
            for (let i = 0; i <= DateUtil.getCountDaysInMonth(monthIndex, year) - 1; i++) {
                days[i] = getDay(i + 1);
            }
            return days;
        };

        return {createMonthDays, getDay, monthIndex, monthNumber, year};
    }

    createYear(selectedDate) {
        const {year, monthNumber} = this.createDate(selectedDate);
        const month = this.createMonth(new Date(year, monthNumber - 1));
        const getMonthDays = monthIndex =>
            this.createMonth(new Date(year, monthIndex)).createMonthDays();
        const createMonths = () => {
            const months = [];
            for (let i = 0; i <= DateUtil.COUNT_MOTHS_IN_YEAR - 1; i++) {
                months[i] = getMonthDays(i);
            }
            return months;
        };

        return {createMonths, month, year};
    }

    /**
     * Зависит от параметра locale
     * @param firstDayOfWeek принимает значение 1 дня недели.
     * По умолчанию отсчет идет от понедельника с индексом [1]
     * @returns названия дней недели в указанном диапазоне
     * */
    getDayNames(firstDayOfWeek = 1) {
        const currentDate = new Date();
        const created = this.createDate();
        const days = Array.from({length: DateUtil.COUNT_DAYS_IN_WEEK}, () => ({
            day: created.day,
            dayShort: created.dayShort
        }));

        days.forEach((_, i) => {
            const {day, dayNumberInWeek, dayShort} = this.createDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + i)
            );
            days[dayNumberInWeek] = {day, dayShort};
        });

        return [...days.slice(firstDayOfWeek), ...days.slice(0, firstDayOfWeek)];
    };

    /**
     * Зависит от параметра locale
     * */
    getMonthNames() {
        const currentDate = new Date();
        const otherDate = this.createDate();
        const months = Array.from({length: DateUtil.COUNT_MOTHS_IN_YEAR}, () => ({
            month: otherDate.month,
            monthShort: otherDate.monthShort,
            monthIndex: otherDate.monthIndex,
            date: otherDate.date,
        }));

        months.forEach((_, i) => {
            const {month, monthIndex, monthShort, date} = this.createDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
            );
            months[monthIndex] = {month, monthIndex, monthShort, date};
        });

        return months;
    }

    /**
     * @returns номер недели в году
     * */
    static getNumberOfWeek(date) {
        const firstDayOfTheYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear =
            (date.getTime() - firstDayOfTheYear.getTime()) / DateUtil.MILLS_IN_DAY;

        return Math.ceil((pastDaysOfYear + firstDayOfTheYear.getDay() + 1) / this.COUNT_DAYS_IN_WEEK);
    }

    static compare(firstDate, secondDate) {
        const min = new Date(Math.min(firstDate.getTime(), secondDate.getTime()));
        const max = new Date(Math.max(firstDate.getTime(), secondDate.getTime()));
        return {min, max};
    }

    static getCountDaysInMonth(monthIndex, yearNumber = new Date().getFullYear()) {
        return new Date(yearNumber, monthIndex + 1, 0).getDate();
    }

    static isToday(otherDate) {
        return DateUtil.isEqualsDate(new Date(), otherDate);
    }

    static isCurrentMonth(otherDate) {
        return new Date().getMonth() === otherDate.getMonth();
    }

    static isEqualsDate(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    static isEqualsTime(date1, date2) {
        return date1.getTime() === date2.getTime();
    }
}

export default DateUtil;
