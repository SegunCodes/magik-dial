# BuzzyCash API

## Prerequisites

Node.js ^(v18.12.1)^
npm ^(v9.1.3)^
MySQL 

## Installation

```shell
$ npm i
```

## Running the Application

```shell
$ npm run build 
$ npm run start
```

## Project Structure
```bash
/
├─ src/               # Source code directory
│   ├─ controllers/   # Controller modules
│   ├─ services/      # Service modules
│   ├─ routes/        # Route modules
│   ├─ config/        # Configuration files
│   ├─ middlewares/   # Middleware files
│   ├─ utils/         # Utils files
│   ├─ validations/   # Validation files
│   └─ tests/         # Test files
├─ dist/              # Compiled JavaScript files
├─ node_modules/      # Node.js dependencies
├─ config/            # Configuration files (if separate from src)
├─ scripts/           # Scripts for handling seeding and other scripts away from src directory
├─ README.md          # Project documentation
├─ package.json       # Project dependencies and scripts
└─ tsconfig.json      # TypeScript configuration
```

## Generating Migration Files
To generate migration files that capture changes to the database schema, use the following command:
```shell
$ npx prisma generate
```

## Applying Migrations
To apply these migrations to your database in development environment, use the following command:
```shell
$ npx prisma migrate dev
```

To apply these migrations to your database in production environment, use the following command:
```shell
$ npx prisma migrate deploy
```

## Running seeds
To seed the admin table in database, use the following command:
```shell
$ npx ts-node scripts/db.seed.ts
```
To seed the product table in database, use the following command:
```shell
$ npx ts-node scripts/products.seed.ts
```
To seed the users table in database, use the following command:
```shell
$ npx ts-node scripts/users.seed.ts
```
To seed the drawpool table in database, use the following command:
```shell
$ npx ts-node scripts/drawpool.seed.ts
```

## Running Tests
To run a test in production, use the following command:
```shell
$ npm test
```

To run a test in development, use the following command:
```shell
$ npm run test-dev
```