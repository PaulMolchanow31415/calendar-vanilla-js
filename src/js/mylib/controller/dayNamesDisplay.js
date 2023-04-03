class DayNamesDisplay {

    /**
     * @param description - DOM элемент верхнего описания
     * */
    constructor(description) {
        this.description = description;
    }

    fill(dayNames) {
        const names = [];

        for (const dayName of dayNames) {
            names.push(`<span class="calendar__top-description">${dayName.dayShort}</span>`)
        }

        this.description.innerHTML = names.join("");
    }

    flush() {
        this.description.innerHTML = '';
    }
}

export default DayNamesDisplay;