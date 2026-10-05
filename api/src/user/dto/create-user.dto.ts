import { Role } from '@prisma/client';
import { IsBoolean, IsEnum } from 'class-validator';

export class CreateUserDto {}

export class ChangeRoleDto {
  @IsEnum(Role)
  role!: Role;
}
export class ChangeActiveDto {
  @IsBoolean()
  isActive!: boolean;
}
