class CustomErrorHandler extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }

  static alreadyExist(message) {
    return new CustomErrorHandler(409, message);
  }

  static wrongCredentials(message = "Wrong usermail or password") {
    return new CustomErrorHandler(401, message);
  }

  static unAuthorized(message = "unAuthorized") {
    return new CustomErrorHandler(401, message);
  }

  static notFound(message = "No user found") {
    return new CustomErrorHandler(404, message);
  }

  static serverError(message = "Internal Server Error") {
    return CustomErrorHandler(500, message);
  }
}

export default CustomErrorHandler;
