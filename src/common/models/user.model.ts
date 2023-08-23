import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop(
    raw({
      firstName: { type: String },
      lastName: { type: String },
      fullName: { type: String },
    }),
  )
  name: Record<string, any>;

  @Prop({ required: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export class UserNameDTO {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}

export class UserDTO {
  @ValidateNested()
  @Type(() => UserNameDTO)
  name: UserNameDTO;

  @IsString()
  @IsNotEmpty()
  email: string;
}

export class UpdateUserNameDTO extends PartialType(UserNameDTO) {}

export class UpdateUserDTO extends PartialType(UserDTO) {}
