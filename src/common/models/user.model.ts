import {
  Prop,
  raw,
  Schema,
  SchemaFactory,
  ModelDefinition,
} from '@nestjs/mongoose';
import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { Document } from 'mongoose';
import { Email } from '../mailer/interfaces/mailer.interface';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({
    required: true,
    minlength: 2,
    maxlength: 16,
  })
  name: string;

  @Prop({ required: true })
  email: Email;

  @Prop({
    type: raw({
      hash: String,
      salt: String,
    }),
    required: true,
  })
  password: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const USER_MODEL_TOKEN = User.name;

export const UserDefinition: ModelDefinition = {
  name: USER_MODEL_TOKEN,
  schema: UserSchema,
};

export class UserDTO {
  @MinLength(2)
  @MaxLength(16)
  public readonly name: string;

  @IsString()
  @IsNotEmpty()
  public readonly email: Email;

  @MinLength(8)
  @MaxLength(20)
  public readonly password: string;
}

export class UpdateUserDTO extends PartialType(UserDTO) {}
