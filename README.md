# FCC-BookTrade
A project created for freeCodeCamp Backend Certification.

# Getting Started

## You will need:
- [MongoDB](https://mlab.com/welcome/)
- [Google Books API Token](https://developers.google.com/books/docs/v1/using)
- [Twitter OAuth Keys](https://dev.twitter.com/resources/signup)
- [GitHub OAuth Keys](https://github.com/settings/developers)

## Once that's done...
1. Copy `.env.example` to `.env` file and fill in all **all** fields

```bash
cp .env.example .env && vim .env
```

2. Install the application dependencies 

```bash
npm i
```

3. Run the server

```bash
npm run dev
```

## Running in production mode
Although this application isn't highly tested and is **not production ready**, you can however minify assets.

1. Compile the assets

```bash
npm run build
```

2. Run the server

```bash
npm start
```