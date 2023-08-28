import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.model';

export type PrivateChatDocument = PrivateChat & Document;

@Schema()
export class PrivateChat {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  senderId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  receiverId: User;

  @Prop({ required: true })
  message: string;

  @Prop({ default: Date.now })
  cDate: Date;
}

export const PrivateChatSchema = SchemaFactory.createForClass(PrivateChat);
