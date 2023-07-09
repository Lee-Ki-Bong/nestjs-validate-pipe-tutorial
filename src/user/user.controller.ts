import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  ParseIntPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async find(@Query() searchDto) {
    return await this.userService.find();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateUserDto) {
    return await this.userService.insert(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserDto,
  ) {
    return await this.userService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.delete(id);
  }
}
