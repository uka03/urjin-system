import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL тохируулаагүй байна.');
}

console.log(`DATABASE_URL : ${connectionString}`);

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !password) {
    throw new Error('Нэр эсвэл пассворт байхгүй байна.');
  }

  if (password.length < 8) {
    throw new Error('Нууц үг 8-аас дээш оронтой байх хэрэгтэй.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      email: email!,
      name,
      passwordHash: passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`ADMIN хэрэглэгч бэлэн боллоо: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
