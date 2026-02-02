import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { Alert } from './schemas/alert.schema';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new price alert' })
  @ApiResponse({ status: 201, description: 'The alert has been successfully created.', type: Alert })
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alerts for a user' })
  @ApiResponse({ status: 200, description: 'List of alerts.', type: [Alert] })
  findAll(@Query('userId') userId: string) {
    return this.alertsService.findAll(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert' })
  @ApiResponse({ status: 200, description: 'The alert has been deleted.' })
  remove(@Param('id') id: string) {
    return this.alertsService.delete(id);
  }
}
