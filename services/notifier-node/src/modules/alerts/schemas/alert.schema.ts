import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AlertDocument = Alert & Document;

export enum AlertCondition {
  ABOVE = 'ABOVE',
  BELOW = 'BELOW',
}

@Schema({ timestamps: true })
export class Alert {
  @ApiProperty({ description: 'The user ID specific to the alert', example: 'user-123' })
  @Prop({ required: true })
  userId: string;

  @ApiProperty({ description: 'The market symbol', example: 'BTC-USD' })
  @Prop({ required: true })
  symbol: string;

  @ApiProperty({ description: 'The price threshold', example: 50000 })
  @Prop({ required: true })
  targetPrice: number;

  @ApiProperty({ enum: AlertCondition, description: 'Condition to trigger the alert' })
  @Prop({ required: true, enum: AlertCondition })
  condition: AlertCondition;

  @ApiProperty({ description: 'Whether the alert is active' })
  @Prop({ default: true })
  isActive: boolean;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
