import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { AppException } from './common/exceptions/app.exception';
import { ResponseInterceptor } from 'common/interceptors/response.interceptor';
import { AppExceptionFilter } from 'common/exceptions/app-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AppExceptionFilter());

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors
          .map((e) => Object.values(e.constraints || {}))
          .flat();

        return new AppException(
          messages.join(', '),
          HttpStatus.BAD_REQUEST,
          'VALIDATION_ERROR',
        );
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
