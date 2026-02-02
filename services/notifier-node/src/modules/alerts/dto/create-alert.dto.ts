import { IsEnum, IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AlertCondition } from '../schemas/alert.schema';

export class CreateAlertDto {
  @ApiProperty({ example: 'user-123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'BTC-USD' })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  targetPrice: number;

  @ApiProperty({ enum: AlertCondition, example: AlertCondition.ABOVE })
  @IsEnum(AlertCondition)
  condition: AlertCondition;
}
