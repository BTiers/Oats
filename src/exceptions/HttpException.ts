class HttpException extends Error {
  public status: number;
  public message: string;
  public hint: any;

  constructor(status: number, message: string, hint: any = undefined) {
    super(message);
    this.status = status;
    this.message = message;
    this.hint = hint;
  }
}

export default HttpException;
