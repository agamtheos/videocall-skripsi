exports.USER_ROLE = {
    ADMIN: 'admin',
    CLIENT: 'client',
  }
  
  exports.RESPONSE_MESSAGE = {
    success: "Success",
    not_found: "Not found",
    bad_request: "Bad request",
    general_error: "General error",
    unauthorized: "Unauthorized",
    not_allowed: "Not allowed access",
    invalid_parameter: (data) => {
      return `Invalid or missing parameter ${data}`
    },
    already_exist: 'Already exist',
  }