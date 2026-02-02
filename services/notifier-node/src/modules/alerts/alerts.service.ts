import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert, AlertDocument } from './schemas/alert.schema';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  constructor(@InjectModel(Alert.name) private alertModel: Model<AlertDocument>) {}

  async create(createAlertDto: CreateAlertDto) {
    const createdAlert = new this.alertModel(createAlertDto);
    return createdAlert.save();
  }

  async findAll(userId: string) {
    return this.alertModel.find({ userId }).exec();
  }

  async findActive() {
    return this.alertModel.find({ isActive: true }).exec();
  }

  async delete(id: string) {
    return this.alertModel.findByIdAndDelete(id).exec();
  }
}
