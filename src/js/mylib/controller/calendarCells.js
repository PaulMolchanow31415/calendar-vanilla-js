import DateUtil from "../utils/dateUtil.js";

class CalendarCells {
    #cells;

    constructor(gridElement) {
        this.#cells = gridElement;
    }

    updateDays(days) {
        this.#cells.dataset.display = "days";
        const {prevMonthDays, monthDays, nextMonthDays} = days;
        const cellContent = [];

        prevMonthDays.forEach(prevDay => cellContent.push(this.#createDay(prevDay, true)));
        monthDays.forEach(day => cellContent.push(this.#createDay(day, false)));
        nextMonthDays.forEach(nextDay => cellContent.push(this.#createDay(nextDay, true)));

        this.#cells.innerHTML = cellContent.join('');
    }

    #createDay(day, isAdditional) {
        return `
        <div 
        class="${[
            "calendar__cell",
            isAdditional ? "calendar__cell--additional" : '',
            DateUtil.isToday(day.date) ? "calendar__cell--now" : '',
        ].join(' ')}" 
            data-time="${day.date}"
        >${day.dayNumber}</div>`;
    }

    updateMonths(months) {
        // решение связано с багом при переключении атрибутов
        setTimeout(() => this.#cells.dataset.display = 'months', 10);
        const cellContent = [];

        months.forEach(month => cellContent.push(this.#createMonth(month)))

        setTimeout(() => this.#cells.innerHTML = cellContent.join(''), 10);
    }

    #createMonth(month) {
        console.log(month.date)
        return `<div 
            class="calendar__cell ${DateUtil.isCurrentMonth(month.date) ? "calendar__cell--now" : ''}" 
            data-month="${month.date}" >${month.month}</div>`;
    }

    selectFirstDay(date) {
        // Ячейка выбирается впервые
        this.#cells.querySelector(`[data-time="${date}"]`)
            .dataset.selected = "first";
    }

    selectSecondDay(secondDate) {
        const firstSelectedDay = this.#cells.querySelector("[data-selected='first']");
        const secondSelectedDay = this.#cells.querySelector(`[data-time="${secondDate}"]`);
        let firstDate;

        // Выбрана дата из другого месяца
        if (!firstSelectedDay) {
            secondSelectedDay.dataset.selected = "second";
            return;
        }

        // Первая ячейка выбрана
        if (firstSelectedDay !== secondSelectedDay) {
            firstDate = new Date(firstSelectedDay.dataset.time);
            secondSelectedDay.dataset.selected = "second";
            this.#selectIntermediateCells(firstDate, secondDate);
        }
    }

    #selectIntermediateCells(firstDate, secondDate) {
        const {min, max} = DateUtil.compare(firstDate, secondDate);

        Array.from(this.#cells.querySelectorAll(".calendar__cell"))
            .filter(cell => {
                const time = new Date(cell.dataset.time);
                return time > min && time < max;
            })
            .map(cell => cell.dataset.selected = "intermediate");
    }
}

export default CalendarCells;