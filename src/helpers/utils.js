const _ = require('lodash')

class utils {
    static missing_params(mandatory, value) {
        let valueObj;
        if (Array.isArray(value)) {
            valueObj = value.map(value => value.trim())
        } else {
            valueObj = _.keys(value).map(value => value.trim())
        }
        let mandatoryParameter = mandatory.map(value => value.trim())
        return mandatoryParameter.filter(v => {
            if (!valueObj.includes(v)) {
                return v
            } else {
                if(typeof value[v] !== "number") {
                    if (_.isEmpty(value[v])) {
                        return v
                    }
                }
            }
        })
    }
}

module.exports = utils