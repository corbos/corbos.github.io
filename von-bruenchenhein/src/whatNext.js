const whatNext = {

    handlers: {},

    on: function (name, handler) {
        if (name in this.handlers) {
            this.handlers[name].push(handler);
        } else {
            this.handlers[name] = [handler];
        }
    },

    off: function (name, handler) {
    },

    emit: function (name, ...args) {

        if (name in this.handlers) {
            for (const handler of this.handlers[name]) {
                handler.apply(null, args);
            }
        }
    }

};
