const util = require('util');

global.consoleMessages = []

function actuallyLog(text, logger) {
    try {
        throw new Error('stacktrace')
    } catch (err) {
        let trace = err.stack.split('\n')
        trace.shift()   // removes Error: stacktrace
        trace.shift()   // removes squirrelAway() call from the "throw" command
        trace.shift()   // removes console logger call in the console override
        consoleMessages.push({logger: logger, payload: text, stacktrace: trace.join('\n')})
    }
}

const orig = console;
global.console = {
    ...console,
    log: (text => actuallyLog(text, orig.log)),
    error: (text => actuallyLog(text, orig.error)),
    warn: (text => actuallyLog(text, orig.warn)),
    info: (text => actuallyLog(text, orig.info)),
    debug: (text => actuallyLog(text, orig.debug))
}

global.afterEach(() => {
    consoleMessages.forEach(msg => {
        if (typeof msg.payload === 'object' || typeof msg.payload === 'function') {
            msg.payload = util.inspect(msg.payload, false, null, true)
        }
        msg.logger.call(msg.logger, msg.payload + '\n' + msg.stacktrace)
    });
});