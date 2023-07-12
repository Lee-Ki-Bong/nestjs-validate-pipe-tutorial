## 시작하기 전에

이 tutorial 은 요청 파라미터에 대한 유효성 검사와 응답 변환하는 방법을 소개하는데 초점을 두었다.

- 전역 파이프와 데코레이터를 통한 요청 파라미터 유효성 검사
- 요청 DTO
- 응답 DTO
- DTO 조립
- DTO 와 Enttity 변환
  
더 다양한 유효성 검사 방식과 자세한 정보를 얻고자 한다면 공식 [docs](https://docs.nestjs.com/techniques/configuration#custom-validate-function) 를 찾아보길 바란다.

#

## 준비

### 이전에 다루었던 내용은 다루지 않을 것이다.

- [nestjs-architecture-sketch](https://git.nm.koapp.com/npm-dev/backend/nestjs-architecture-sketch/-/blob/develop/README.md#%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0-%EC%A0%84%EC%97%90)
- [nestjs-typeorm-tutorial](https://git.nm.koapp.com/npm-dev/backend/nestjs-typeorm-tutorial/-/blob/develop/README.md#%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0-%EC%A0%84%EC%97%90)

### 패키지 설치

```
yarn add class-validator
npm install class-validator
```

```
yarn add class-transformer
npm install class-transformer
```

```
yarn add @nestjs/config
npm install @nestjs/config
```

```
yarn add @nestjs/typeorm typeorm mysql2
npm install @nestjs/typeorm typeorm mysql2
```

#

## 전역 파이프

### 전역 파이프 의존성 주입

- 아래에 제시한 파이프 옵션은 개방 폐쇄 원칙(OCP)을 준수하는 방법 중 하나이다.
- 이유는 이 옵션들을 사용함으로써 개발시에 자연스레 폐쇄 원칙을 지킬 수 있기 때문이다.
  - DTO에 엄격한 규칙을 적용하여 요청의 무결성을 유지.
  - 새로운 속성이나 요청 형태에 대한 확장성을 보장.

```javascript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
  ],
  controllers: [],
  providers: [
    // 전역 파이프 의존성 주입
    {
      provide: APP_PIPE,
      useFactory: () => {
        const validationOptions: ValidationPipeOptions = {
          whitelist: true, // DTO 맴버가 아니면 전달자체가 되지 않는 옵션.
          forbidNonWhitelisted: true, // DTO 맴버가 아니면 요청을 막을 수 있음. error 를 반환 (whitelist: true와 같이 사용해야함.)
          transform: true, // 컨트롤러 매개변수 타입으로 transform
        };
        return new ValidationPipe(validationOptions);
      },
    },
  ],
})
export class AppModule {}
```

### transform: true 옵션

#### 특징

- 이 옵션을 주지 않거나 false 일 경우 number 로 선언하여도 형변환이 되지 않는다.
- 그리고 주의할점은 형변환이 가능한 형태로 들어와야 하며, 변환에 실패하면 에러가 발생한다.
- 때문에 ParseIntPipe 와 같은 파이프를 함께 사용해주어야한다.
- 자세한 내용은 docs 를 참고하길 바란다. [링크](https://docs.nestjs.com/pipes#built-in-pipes)

```javascript
@Get('/users')
getUserById(@Query('id') userId: number) {
  console.log(typeof userId); // 출력: string
}
```

#### 쿼리 파라미터 형변환

```javascript

// GET /users?id=123
@Get('/users')
getUserById(@Query('id') userId: number) {
  console.log(typeof userId); // 출력: number
  // userId 변수는 자동으로 숫자로 형변환.
}
```

#### 요청 Body 형변환

```javascript
// POST /users
@Post('/users')
createUser(@Body() createUserDto: CreateUserDto) {
  console.log(typeof createUserDto.age); // 출력: number
  // createUserDto.age 속성은 자동으로 숫자로 형변환.
}
```

#### 컨트롤러 매개변수 형변환

```javascript
// GET /users/:id
@Get('/users/:id')
getUserById(@Param('id') userId: number) {
  console.log(typeof userId); // 출력: number
  // userId 변수는 자동으로 숫자로 형변환.
}
```

### whitelist: true 옵션

- DTO에 정의되지 않은 속성이 요청에 포함되면 해당 속성을 무시된다.
- 아래의 DTO 가 있을때

```javascript
export class CreateUserDto {
  u_name: string;
  u_email: string;
  u_password: string;
  u_is_agree: YesNoEnum;
}
```

- 맴버에 포함되지 않는 속성이 들어오면

```
{
  "u_name" : "홍길홍",
  "u_email" : "test2@gmail.com",
  "u_password" : "1234A!",
  "u_is_agree" : "Y",
  "u_phone" : "01012341234" // 정의 되지 않은 속성
}
```

```javascript
  @Post()
  async create(@Body() createDto: CreateUserDto) {
    console.log(createDto);
    return await this.userService.save(createDto);
  }
```

- 출력 : 정의 되지 않은 속성이 제외 된 모습

```
{
	"u_name" : "홍길홍",
	"u_email" : "test2@gmail.com",
	"u_password" : "1234A!",
	"u_is_agree" : "Y"
}
```

### forbidNonWhitelisted: true 옵션

- DTO에 정의되지 않은 속성이 요청에 포함되면 요청을 막고 에러를 반환한다.
- 아래의 DTO가 있을 때

```javascript
export class CreateUserDto {
  u_name: string;
  u_email: string;
  u_password: string;
  u_is_agree: YesNoEnum;
}
```

- 맴버에 포함되지 않는 속성이 들어오면

```
{
  "u_name": "홍길홍",
  "u_email": "test2@gmail.com",
  "u_password": "1234A!",
  "u_is_agree": "Y",
  "u_phone": "01012341234" // 정의되지 않은 속성
}

```

- 출력: 요청이 막히고 에러가 반환된다.

```
{
	"statusCode": 400,
	"message": [
		"property u_phone should not exist"
	],
	"error": "Bad Request"
}
```

#

## class-validator 패키지의 데커레이터를 활용한 유효성 검사

- 앞서 ValidationPipe 전역파이프 의존성 주입으로 인해, 해당 패키지의 데커레이터로 유효성 검사가 이루어 진다.
- 즉, ValidationPipe 를 의존성주입하지 않으면 데커레이터가 있어도 유효성 검사가 이루어 지지 않는다.

### DTO 에 데커레이터 추가

- 더 다양한 데커레이터와 방식이 있다. 한번씩 찾아보길 바란다.

```javascript
export class CreateUserDto {
  @IsNotEmpty() // 필수 입력 필드여야 함을 나타냄
  @IsString() // 문자열이어야 함을 나타냄
  @Length(1, 100) // 문자열 길이가 1 이상 100 이하여야 함을 나타냄
  u_name: string;

  @IsNotEmpty() // 필수 입력 필드여야 함을 나타냄
  @IsEmail() // 유효한 이메일 형식이어야 함을 나타냄
  u_email: string;

  @IsNotEmpty() // 필수 입력 필드여야 함을 나타냄
  @Length(4, 12) // 문자열 길이가 4 이상 12 이하여야 함을 나타냄
  @Matches(/^(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!@#$%^&*]).*$/, {
    message: UserMessages.ERROR_REGEX_PASSWORD, // src/user/constants/user.constants.ts 참고
  }) // 정규식 패턴에 맞아야 함을 나타냄
  u_password: string;

  @IsOptional() // 선택적 입력 필드임을 나타냄
  @IsEnum(YesNoEnum) // 지정된 열거형 값 중 하나여야 함을 나타냄
  u_is_agree: YesNoEnum;
}
```

- 검사에 실패하면 다음과 같은 예외를 발생시킨다.

```
{
	"statusCode": 400,
	"message": [
		"u_name must be longer than or equal to 1 characters",
		"u_name must be a string",
		"u_name should not be empty",
		"u_email must be an email",
		"u_email should not be empty",
		"비밀번호는 대문자, 특수문자, 숫자를 포함해야 합니다.",
		"u_password must be longer than or equal to 4 characters",
		"u_password should not be empty",
    "u_is_agree must be one of the following values: Y, N"
	],
	"error": "Bad Request"
}
```

#

## 요청 파라미터의 다양함

- 요청 데이터가 항상 처리하기 좋게 깨끗한 형태로 들어오면 좋겠지만, 실무에선 그렇지 못한 경우가 발생한다.
- 다양한 요청 파라미터를 다루는 방법과 Mapped 패키지를 사용하여 DTO를 구성하는 방법을 소개하겠다.

#

## Mapped Types 패키지의 대표 기능 소개

- 잘 쪼개진 DTO 들을 아래 기능들을 조합하여 사용할 수 있다.

### PartialType

- 기존 DTO를 상속받아 일부 속성을 선택적으로 업데이트할 수 있는 DTO를 생성하는 용도.
- Create DTO 의 validate 데커레이터를 재활용함이 목적.

```javascript
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### PickType

- 기존 DTO에서 필요한 일부 속성만 선택하여 새로운 DTO를 생성

```javascript
import { PickType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';

export class PublicUserDto extends PickType(UserDto, ['name', 'email']) {}
```

### OmitType

```javascript
import { OmitType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';

export class AdminUserDto extends OmitType(UserDto, ['password']) {}
```

### IntersectionType

- 두 개 이상의 DTO를 합쳐 새로운 DTO를 생성한다. 합쳐친 모든 속성들을 그대로 가지게 된다.
- 더 구체화하고 합칠 때 사용

```javascript
import { IntersectionType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';
import { AdditionalInfoDto } from './additional-info.dto';

export class CompleteUserDto extends IntersectionType(
  UserDto,
  AdditionalInfoDto,
) {}
```

### 응용

- 이런 식으로 조합하여 사용가능하다.

```javascript
export class UserWithProfileDTO extends IntersectionType(
  UserDTO,
  PickType(ProfileDTO, ['avatar']),
) {}
```

#

## 커스텀 파이프활용

- CreateProductDto 와 CreateProductOptionDto 이 구조화(조립) 되어있지 않다면 이 방법을 활용해야한다.

### 파이프 안에서 validate

```javascript
@Injectable()
export class ProductPipe implements PipeTransform {
  async transform(prdDto: any, metadata: ArgumentMetadata) {
    prdDto = plainToInstance(CreateProductDto, prdDto);
    prdDto.options = plainToInstance(CreateProductOptionDto, prdDto.options);

    /**
     * @step1 이 파이프에서 사용될 validator 에서 체크할 옵션
     */
    const validatorOptions = {
      enableDebugMessages: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    };

    /**
     * @step2 prdDto & prdOptions validate
     * - 반드시 배열 dto 이면 map 으로 체크 해야한다.
     */
    const errorsProduct = await validate(prdDto, validatorOptions);
    let errorsOptions = [];
    if (Array.isArray(prdDto.options)) {
      errorsOptions = await Promise.all(
        prdDto.options.map((optDto: CreateProductOptionDto) =>
          validate(optDto, validatorOptions),
        ),
      );
    }

    /**
     * @step3 에러 처리
     */
    const allErrors = [...errorsProduct, ...errorsOptions.flat()];
    if (allErrors.length > 0) {
      throw new BadRequestException(allErrors);
    }

    /**
     * @step4 리턴
     */
    return prdDto;
  }
}
```

### 컨트롤러에 적용한 모습

- productData 매개변수는 파이프에서 리턴한 prdDto 값을 가지게 된다.

```javascript
@Post('/product')
async createProduct(@Body(ProductPipe) productData: CreateProductDto) {
  // productData는 ProductPipe에서 반환된 값을 가지게 됨.
  return product;
}
```

## 파라미터 분리하는 방법

- 파이프에서 여러 값을 반환하고 컨트롤러 메서드에서 해당 값을 분리적으로 사용하고자 할 때 유용하다.
- 이건 필자의 사견인데 이렇게 쓰지말고, [DTO를 조합](#intersectiontype)하여 사용하는걸 권장한다.
  - DTO는 요청을 정의하는 의미도 있는데, 이렇게 되면 실제 요청과 DTO간의 괴리가 발생한다.

### 파이프에서 분리하여 리턴

```javascript
@Injectable()
export class ProductPipe implements PipeTransform {
  async transform(prdDto: any, metadata: ArgumentMetadata) {
    const productDto = plainToInstance(CreateProductDto, prdDto);
    const productOptionDto = plainToInstance(
      CreateProductOptionDto,
      prdDto.options,
    );
    return { productDto, productOptionDto }; // 이렇게 분리하여 리턴
  }
}
```

```javascript
@Post('/product')
@UsePipes(ProductPipe) // ProductPipe를 적용
async createProduct(
  @Body() productData: CreateProductDto,
  @Body() productOptionData: CreateProductOptionDto,
) {
  // productData는 ProductPipe를 거쳐 변환된 첫번째 값.
  // productOptionData는 ProductPipe를 거쳐 변환된 두번째 값.
  // 즉 파이프 리턴순서와 매개변수 순서를 꼭 확인해야한다.
  return product;
}
```

#

## plainToInstance() 에서 제안하고 싶은부분

- planToInstance() 의 excludeExtraneousValues: true 옵션을 항상 사용했으면 한다.
- 이 옵션은 정의한 속성이 아니면 제외되기 때문에, 개방 폐쇄원칙을 준수하는데 도움을 준다.

### plainToInstance() 함수는 다음과 같은 시나리오에서 유용하다.

NestJS를 다루다보면 다양한 부분에서 이함수를 사용하게 된다.

- 이미 존재하는 객체에 새로운 데이터를 할당하고 싶을 때.
- 기존 객체를 유지한 채로 속성 값을 변경하고 싶을 때.
- 복잡한 객체 간의 값을 복사하고 싶을 때.

### DTO & Entity 변환 심화

- transform 패키지의 planToInstance()의 옵션을 소개하겠다.
- 이를 통해 DTO와 Entity 간의 데이터 전환을 좀 더 용이하게 처리할 수 있다.

### create DTO 를 Entity 로 변환할때

```javascript
import { planToInstance } from 'class-transformer';

class UserService {
  createUser(userDTO: UserDTO): UserEntity {
    const userEntity = planToInstance(UserEntity, userDTO, {
      excludeExtraneousValues: true, // 없는 속성은 무시
    });
    return userEntity;
  }
}
```

## 응답 변환

- 서버에서 메시지와 함께 데이터를 응답해야할 경우가 있을 것이다.

### 메시지와 데이터로 이루어진 응답 DTO 예시

- 아래는 예시를 들기위해 하나로 쭉 작성한것이다. DTO 별로 파일을 나누어 관리 해야한다.

```javascript
// 데이터 전송 객체
export class ResponseUserDto {
  @Expose()
  u_name: string;

  @Expose()
  u_email: string;

  @Expose()
  u_is_agree: YesNoEnum;
}

// 공통 메시지 & 데이터 응답 구조 DTO
export class ResponseDataAndMessageDto<T> {
  @Expose()
  data: T;

  @Expose()
  message: string;
}

// ProductMudule 에서 공통 DTO 상속받아 구현.
// 단일
export class ResponseUserAndMessageDto extends ResponseDataAndMessageDto<ResponseUserDto> {
  @Type(() => ResponseUserDto)
  @Expose()
  data: ResponseUserDto;
}

// ProductMudule 에서 공통 DTO 상속받아 구현.
// 리스트
export class ResponseUsersAndMessageDto extends ResponseDataAndMessageDto<
  ResponseUserDto[],
> {
  @Type(() => ResponseUserDto)
  @Expose()
  data: ResponseUserDto[];
}
```

### plainToInstance() 사용하여 Entity -> DTO 변환

```javascript
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
    const responeData = plainToInstance(ResponseUserAndMessageDto, { // 변환
      data: newUser,
      message: '회원 가입을 축하드립니다.',
    });
    console.log(responeData);
    return responeData;
  }
```

### 변환이 잘 이루어진 모습

- console.log(responeData);

```
ResponseUserAndMessageDto {
  data: ResponseUserDto {
    u_id: 11,
    u_name: '홍두께',
    u_email: 'test2@gmail.com',
    u_password: '1234A!',
    u_is_agree: 'Y'
  },
  message: '회원 가입을 축하드립니다.'
}
```

#
