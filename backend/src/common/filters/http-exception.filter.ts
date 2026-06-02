import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal Server Error';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        errors = (res as any).error || (res as any).message || [];
        if (!Array.isArray(errors)) {
          errors = [errors];
        }
      } else {
        message = exception.message;
      }
    } else {
      // Log unhandled server errors (database, redis etc.)
      this.logger.error(
        `Unhandled error encountered: ${exception?.message || exception}`,
        exception?.stack,
      );
    }

    response.status(status).json({
      success: false,
      message: Array.isArray(errors) && errors.length > 0 ? 'Validation Error' : message,
      errors: Array.isArray(errors) ? errors : [errors],
    });
  }
}
