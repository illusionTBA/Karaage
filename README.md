# Karaage 🐔
- An API for gogoanime


## Prerequisites
- [Bun](https://bun.sh/) 

- Redis (as long as its compatible with ioredis you can use whatever redis alt you want!)
## Usage

To install dependencies:

```bash
bun install
```

To run:

```bash
bun setup && bun start
```

### Seeding 

- It is generally recommended to seed the database with completed animes so that by default all completed animes will be in the database. This saves us and the user time later.

To Seed:

```bash
bun seed
```
