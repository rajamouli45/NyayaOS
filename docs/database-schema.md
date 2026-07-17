# Database Schema Design

We use Prisma ORM for relational models.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Citizen {
  id        String   @id @default(uuid())
  fullName  String
  nationalId String  @unique
  cases     Case[]
  createdAt DateTime @default(now())
}

model Case {
  id          String   @id @default(uuid())
  title       String
  citizenId   String
  citizen     Citizen  @relation(fields: [citizenId], references: [id])
  status      String   // e.g. DRAFT, DISPATCHED, ARCHIVED
  workflowLog String   // JSON history log
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```
