import { Expose, Type } from 'class-transformer';
import { YesNoEnum } from '../enums/mini.enums';

export class ResponseUserDto {
  @Expose()
  u_name: string;

  @Expose()
  u_email: string;

  @Expose()
  u_is_agree: YesNoEnum;
}

// @todo : 공통 디렉토리로 이동.
// 공용 메시지와 응답 DTO
export class ResponseDataAndMessageDto<T> {
  @Expose()
  data: T;

  @Expose()
  message: string;
}

// @todo : 따로 파일로.
// 실제 사용모듈에서 메시지 & 데이터 응답 DTO 를 상속하여 구현.
export class ResponseUserAndMessageDto extends ResponseDataAndMessageDto<ResponseUserDto> {
  @Type(() => ResponseUserDto)
  @Expose()
  data: ResponseUserDto;
}

// @todo : 따로 파일로.
// 실제 사용모듈에서 메시지 & 데이터 응답 DTO 를 상속하여 구현.
export class ResponseUsersAndMessageDto extends ResponseDataAndMessageDto<
  ResponseUserDto[]
> {
  @Type(() => ResponseUserDto)
  @Expose()
  data: ResponseUserDto[];
}
