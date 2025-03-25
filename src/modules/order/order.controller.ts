import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateShippingInfoDto } from './dto/create-order.dto';
import { Order } from './schemas/order.schema';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Tạo Order
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.create(createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('userId') userId?: string): Promise<Order[]> {
    return this.orderService.findAll(userId ? new Types.ObjectId(userId) : undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orderService.updateStatus(id, updateStatusDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/shipping-info')
  async updateShippingInfo(
    @Param('id') id: string,
    @Body() shippingInfoDto: UpdateShippingInfoDto,
  ): Promise<Order> {
    return this.orderService.updateShippingInfo(id, shippingInfoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/mark-paid')
  async markAsPaid(@Param('id') id: string): Promise<Order> {
    return this.orderService.markAsPaid(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Order> {
    return this.orderService.remove(id);
  }
}