import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { YesNoEnum } from '../enums/mini.enums';
import { UserMessages } from '../constants/user.constants';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  u_name: string;

  @IsNotEmpty()
  @IsEmail()
  u_email: string;

  @IsNotEmpty()
  @Length(4, 12)
  @Matches(/^(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!@#$%^&*]).*$/, {
    message: UserMessages.ERROR_REGEX_PASSWORD,
  })
  u_password: string;

  @IsOptional()
  @IsEnum(YesNoEnum)
  u_is_agree: YesNoEnum;
}
