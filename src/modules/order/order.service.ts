import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateShippingInfoDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

    // Tạo Order
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // For COD orders, set isPaid to false initially
    // For VNPAY, we would need to handle payment processing (simplified here)
    const isPaid = createOrderDto.paymentMethod === 'COD' || createOrderDto.isPaid === true;
    
    const newOrder = new this.orderModel({
      ...createOrderDto,
      isPaid,
      status: 'pending',
    });

    return newOrder.save();
  }

  async findAll(userId?: Types.ObjectId): Promise<Order[]> {
    const filter = userId ? { userId } : {};
    return this.orderModel.find(filter)
      .populate('userId', 'name email')
      .populate('productId', 'name price description')
      .exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id)
      .populate('userId', 'name email')
      .populate('productId', 'name price description')
      .exec();
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return order;
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findById(id);
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // When marking an order as completed and it's COD, set isPaid to true
    if (updateStatusDto.status === 'completed' && order.paymentMethod === 'COD') {
      order.isPaid = true;
    }
    
    order.status = updateStatusDto.status;
    return order.save();
  }

  async updateShippingInfo(id: string, shippingInfoDto: UpdateShippingInfoDto): Promise<Order> {
    const order = await this.orderModel.findById(id);
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    // Only allow updating shipping info when order is still pending
    if (order.status !== 'pending') {
      throw new BadRequestException('Cannot update shipping information of non-pending order');
    }
    
    order.fullName = shippingInfoDto.fullName;
    order.phoneNumber = shippingInfoDto.phoneNumber;
    order.address = shippingInfoDto.address;
    order.city = shippingInfoDto.city;
    
    return order.save();
  }

  async markAsPaid(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id);
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    if (order.isPaid) {
      throw new BadRequestException('Order is already paid');
    }
    
    order.isPaid = true;
    return order.save();
  }

  async remove(id: string): Promise<Order> {
    const deletedOrder = await this.orderModel.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return deletedOrder;
  }
}
