const pagination = {};

pagination.getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? ((page * limit) - limit) : 0;
    return { limit, offset };
}

pagination.getMetaData = (total, page, limit) => {
    const currentPage = page ? +page : 1;
    totalPages = Math.ceil(total / limit);
    return { total: total, totalPages, currentPage, pageSize: limit };
}

module.exports = pagination