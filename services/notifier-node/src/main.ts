import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const configService = app.get(ConfigService);
  const rmqUser = configService.get<string>('RABBITMQ_USER');
  const rmqPass = configService.get<string>('RABBITMQ_PASS');
  const rmqHost = configService.get<string>('RABBITMQ_HOST', 'rabbitmq');
  const rmqPort = configService.get<string>('RABBITMQ_PORT', '5672');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${rmqUser}:${rmqPass}@${rmqHost}:${rmqPort}`],
      queue: 'notifications_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('Notifier Service API')
    .setDescription('API for managing alerts and receiving real-time notifications')
    .setVersion('1.0')
    .addTag('notifications')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
