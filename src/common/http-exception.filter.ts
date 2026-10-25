import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body: any = exception.getResponse();
      const message = typeof body === 'string' ? body : Array.isArray(body?.message) ? body.message.join(', ') : body?.message ?? 'Request failed';
      return response.status(status).json({ error: { code: body?.error?.code ?? `HTTP_${status}`, message, ...(body?.details ? { details: body.details } : {}) } });
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const status = exception.code === 'P2025' ? HttpStatus.NOT_FOUND : exception.code === 'P2002' ? HttpStatus.CONFLICT : exception.code === 'P2003' ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : exception.code === 'P2025' ? 'Record not found' : exception.code === 'P2002' ? 'A record with this value already exists' : 'Related record is invalid';
      return response.status(status).json({ error: { code: exception.code, message } });
    }
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
  }
}
