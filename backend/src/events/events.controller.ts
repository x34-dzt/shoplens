import {
  Body,
  Controller,
  Param,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post(':storeId')
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('storeId') storeId: string, @Body() dto: CreateEventDto) {
    return this.eventsService.ingest(storeId, dto);
  }
}
