import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8)
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
