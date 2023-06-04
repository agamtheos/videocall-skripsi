/**
 * Cek by roles by token claim
 * @param roles {string}
 * @return {function(e.Request, e.Response, e.NextFunction)}
 */
module.exports = (...roles) => (req, res, next) => {
    // cek for auth data
    for (let role of roles) {
        // check desired custom claim in auth and check is it truthy
        if (req.auth && req.auth.role === role) {
            return next();
        }
    }
    // no roles match
    res.API.error('Anda tidak mempunyai akses', 403);
};
