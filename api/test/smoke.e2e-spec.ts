import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
// import { describe, it } from 'node:test';

describe('Smoke Test (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Апп ерөнхийдөө асаж байгаа эсэх
  it('/ (GET) — health check', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });

  // 2. DB холболт шалгах (жишээ нь health endpoint байгаа бол)
  it('/health (GET) — DB болон гол сервисүүд ажиллаж байгаа эсэх', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  // 3. Auth-той endpoint — token байхгүй үед 401 ирэх ёстой
  // it('/users/me (GET) — auth guard ажиллаж байгаа эсэх', () => {
  //   return request(app.getHttpServer()).get('/users/me').expect(401);
  // });

  // 4. Гол CRUD endpoint-уудын аль нэг нь хариу өгч байгаа эсэх
  //   it('/products (GET) — гол resource endpoint амьд эсэх', () => {
  //     return request(app.getHttpServer()).get('/products').expect(200);
  //   });
});
