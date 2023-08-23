import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDTO,
  UpdateUserDTO,
  UserDocument,
} from 'src/common/models/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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
}
