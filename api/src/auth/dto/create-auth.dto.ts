import { IsEmail, IsEnum, IsString } from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALES = 'SALES',
  WAREHOUSE = 'WAREHOUSE',
  FINANCE = 'FINANCE',
  PRODUCTION = 'PRODUCTION',
}

export class CreateAuthDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
