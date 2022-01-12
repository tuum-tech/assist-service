const info = (namespace: string, did: string, message: string, object?: any) => {
    if (object) {
        console.info(`[${getTimeStamp()}] [INFO] [${namespace}] - "${did}": ${message}`, object);
    } else {
        console.info(`[${getTimeStamp()}] [INFO] [${namespace}] - "${did}": ${message}`);
    }
};

// (namespace: string, message: string, did?: string, object?: any)
const warn = (namespace: string, did: string, message: string, object?: any) => {
    if (object) {
        console.warn(`[${getTimeStamp()}] [WARN] [${namespace}] - "${did}": ${message}`, object);
    } else {
        console.warn(`[${getTimeStamp()}] [WARN] [${namespace}] - "${did}": ${message}`);
    }
};

const error = (namespace: string, did: string, message: string, object?: any) => {
    if (object) {
        console.error(`[${getTimeStamp()}] [ERROR] [${namespace}] - "${did}": ${message}`, object);
    } else {
        console.error(`[${getTimeStamp()}] [ERROR] [${namespace}] - "${did}": ${message}`);
    }
};

const debug = (namespace: string, did: string, message: string, object?: any) => {
    if (object) {
        console.debug(`[${getTimeStamp()}] [DEBUG] [${namespace}] - "${did}": ${message}`, object);
    } else {
        console.debug(`[${getTimeStamp()}] [DEBUG] [${namespace}] - "${did}": ${message}`);
    }
};

const getTimeStamp = (): string => {
    return new Date().toISOString();
};

const logging = {
    info,
    warn,
    error,
    debug
};
export default logging;
