  import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
  import { HydratedDocument } from 'mongoose';

  export type UserDocument = HydratedDocument<User>;

  @Schema({ timestamps: true })
  export class User {
    @Prop()
    userName: string;

    @Prop()
    password: string;

    @Prop()
    fullname: string;

    @Prop()
    email: string;

    @Prop()
    phone: string;

    @Prop()
    address: string;

    @Prop()
    dob: Date;

    @Prop()
    isBan: boolean;

    @Prop({ default: 'Offline' })
    status: string;

    @Prop({ default: 'USERS' })
    role: string;

    @Prop({ default: 'LOCAL' })
    accountType: string;

    @Prop({ default: false })
    isActive: boolean;

    @Prop()
    activeCode: string;

    @Prop()
    codeExpired: Date;

    @Prop()
    image: string;

    @Prop()
    totalFollowers: number;

    @Prop()
    totalFollowings: number;

    @Prop()
    isShop: boolean;

    @Prop({ type: Object })
    shopOwnerDetail: {
      shopName: string;
      taxCode: string;
      shopBrandsAddress: string;
      shopDescription: string;
    };
  }

  export const UserSchema = SchemaFactory.createForClass(User);
