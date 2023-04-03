class Client {
    constructor(params) {
        this.api = params.api;
        this.logs = params.logs;
    }

    send(obj) {
        /*fetch(this.api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(obj)
        }).then(response => this.logs ? console.log(response) : undefined)
            .catch(reason => this.logs ? console.log(reason) : undefined);*/

        // тут я намерено сделал (ответ), из-за отсутствия сервера
        return JSON.stringify(obj);
    }
}

export default Client;