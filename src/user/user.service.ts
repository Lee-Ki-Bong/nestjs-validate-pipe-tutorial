import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import {
  CreateUserDto,
  ResponseUserAndMessageDto,
  ResponseUserDto,
  ResponseUsersAndMessageDto,
  UpdateUserDto,
} from './dto';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async find() {
    const userList = await this.userRepository.find();
    return plainToInstance(ResponseUserDto, userList, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: number) {
    const userRow = await this.userRepository.findOne({ where: { u_id: id } });
    return plainToInstance(ResponseUserDto, userRow, {
      excludeExtraneousValues: true,
    });
  }

  async insert(createDto: CreateUserDto) {
    const res = await this.userRepository.insert(createDto);
    if (res.raw.affectedRows < 1) {
      throw new HttpException(
        '회원 등록에 실패했습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newUser = await this.userRepository.findOne({
      where: { u_id: res.raw.insertId },
    });
    const responeData = plainToInstance(
      ResponseUserAndMessageDto,
      {
        data: newUser,
        message: '회원 가입을 축하드립니다.',
      },
      {
        excludeExtraneousValues: true,
      },
    );
    console.log(responeData);
    return responeData;
  }

  async update(id: number, updateDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { u_id: id } });
    if (!user) {
      throw new HttpException(
        '회원이 존재하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const res = await this.userRepository.update(id, updateDto);
    if (res.affected < 1) {
      throw new HttpException(
        '회원 수정에 실패했습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newUser = await this.userRepository.findOne({ where: { u_id: id } });
    const responeData = plainToInstance(
      ResponseUsersAndMessageDto,
      {
        data: newUser,
        message: '회원 정보가 수정되었습니다.',
      },
      {
        excludeExtraneousValues: true,
      },
    );
    console.log(responeData);
    return responeData;
  }

  async delete(id: number) {
    const res = await this.userRepository.delete(id);
    return res;
  }
}
