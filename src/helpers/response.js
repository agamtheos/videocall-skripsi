const buildResponse = (status, data, message, meta = {}) => {
    return {
        status,
        message,
        data,
        meta,
    };
};

module.exports = (req, res, next) => {
    res.API = {
        success: (data = {} , code = 200, meta = {}, message = "OK") => 
            res.status(code).json(buildResponse(true, data, message, meta)),
        error: (message, code = 500, meta = {}) =>
            res.status(code).json(buildResponse(false, undefined, message, meta))
    };
    next();
};
