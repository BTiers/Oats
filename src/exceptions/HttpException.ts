/**
 * @swagger
 * definitions:
 *  HTTPError:
 *    description: Representation of an HTTP Error
 *    properties:
 *      status:
 *        type: number
 *        description: The HTTP code of the error
 *      message:
 *        type: string
 *        description: A user friendly representation of the error that occured
 *        example: No offer found
 *      hint:
 *        type: string
 *        description: An object with multiple elements that can help fixing the error
 */

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
