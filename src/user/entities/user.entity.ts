import { YesNoEnum } from '../enums/mini.enums';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ comment: '회원 번호' })
  u_id: number;

  @Column({ type: 'varchar', length: 100, comment: '성함' })
  u_name: string;

  @Column({ type: 'varchar', length: 100, comment: '대표메일' })
  u_email: string;

  @Column({ type: 'varchar', comment: '비밀번호' })
  u_password: string;

  @Column({
    type: 'enum',
    enum: YesNoEnum,
    comment: '동의 여부',
    default: YesNoEnum.YES,
  })
  u_is_agree: YesNoEnum;
}
