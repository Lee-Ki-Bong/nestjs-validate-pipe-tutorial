import { Module, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { APP_PIPE } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () => {
        const validationOptions: ValidationPipeOptions = {
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        };
        return new ValidationPipe(validationOptions);
      },
    },
  ],
})
export class AppModule {}
