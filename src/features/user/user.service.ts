import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Email } from 'src/common/mailer/interfaces/mailer.interface';
import {
  User,
  UserDTO,
  UpdateUserDTO,
  UserDocument,
  USER_MODEL_TOKEN,
} from 'src/common/models/user.model';
import { CommonUtility } from 'src/core/utils/common.utility';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(USER_MODEL_TOKEN)
    private readonly userModel: Model<UserDocument>,
  ) {}

  create(user: UserDTO) {
    return this.userModel.create(user);
  }

  findAll() {
    return this.userModel.find();
  }

  findById(id: string) {
    return this.userModel.findById(id);
  }

  updateById(id: string, data: UpdateUserDTO) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true });
  }

  removeById(id: string) {
    return this.userModel.findByIdAndRemove(id);
  }

  createUser(user: UserDTO) {
    const { name, email } = user;

    const password = CommonUtility.encryptBySalt(user.password);

    return this.userModel.create({
      name,
      email,
      password,
    });
  }

  async hasUser(email: Email) {
    const res = await this.userModel.exists({ email });

    return !!res;
  }

  async findUser(filter: FilterQuery<UserDocument>) {
    return await this.userModel.findOne(filter);
  }
}
