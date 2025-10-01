import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';
import { MockMinioService } from './mock-minio.service';
import { MinioConfig } from './minio-config.interface';

@Global()
@Module({
  providers: [
    {
      provide: MinioService,
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');

        if (nodeEnv === 'development' && !configService.get<string>('MINIO_ENDPOINT')) {
          return new MockMinioService();
        }

        const config: MinioConfig = {
          endPoint: configService.get<string>('MINIO_ENDPOINT', 'localhost'),
          port: configService.get<number>('MINIO_PORT', 9000),
          useSSL: configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
          accessKey: configService.get<string>('MINIO_ACCESS_KEY', 'melio'),
          secretKey: configService.get<string>('MINIO_SECRET_KEY', 'melio123'),
          bucketName: configService.get<string>('MINIO_BUCKET', 'melio-files'),
        };
        return new MinioService(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [MinioService],
})
export class MinioModule {}
