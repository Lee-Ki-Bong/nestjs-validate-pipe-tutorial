import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableNamingStrategy } from './table-naming.strategy';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: await configService.getOrThrow('MYSQL_HOST'),
        port: await configService.getOrThrow('MYSQL_PORT'),
        database: await configService.getOrThrow('MYSQL_DATABASE'),
        username: await configService.getOrThrow('MYSQL_USERNAME'),
        password: await configService.getOrThrow('MYSQL_PASSWORD'),
        autoLoadEntities: true,
        synchronize: false,
        logging: true,
        namingStrategy: new TableNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
