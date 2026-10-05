import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateUserDto {}

export class ChangeRoleDto {
  @IsEnum(Role)
  role!: Role;
}
