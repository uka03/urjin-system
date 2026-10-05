import { Injectable } from '@nestjs/common';
import { ChangeRoleDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from 'common/dto/pagination.dto';
import { MetaData } from 'common/types/meta.type';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(pagination: PaginationDto) {
    const page = pagination.page;
    const limit = pagination.limit;
    const query = pagination.q;
    const skip = page - 1;
    const condition = {
      name: {
        contains: query,
      },
    };

    const [users, totalCount] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: condition,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: {
          name: 'asc',
        },
        skip,
      }),
      this.prisma.user.count({ where: condition }),
    ]);

    const totalPage = Math.ceil(totalCount / limit);

    const meta: MetaData = {
      page: page,
      totalItem: totalCount,
      totalPage: totalPage,
      limit: limit,
    };
    return { users, meta };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: string, dto: ChangeRoleDto) {
    console.log(dto);
    const user = await this.prisma.user.update({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      data: dto,
    });
    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
