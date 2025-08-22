## Getting started

### Requirements

1. You must [download and install Node.js] 16+.
1. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
1. You must create a store for testing if you don't have one, either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store).
1. Use Shopify CLI 3.0
1. Use Ruby 3.0.*


Cài npm vào dự án
```shell
npm install
```

## Update file shopify.app.toml
Đổi thành URL backend đã tạo
application_url = "https://destroyed-transaction-workers-disposition.trycloudflare.com"

Thay bằng url Frontend đã tạo. Chú ý vẫn giữ lại api/exchange-token/callback
redirect_urls = [
  "https://schedule-cab-breeds-licenses.trycloudflare.com/api/exchange-token/callback"
]


Run project
```shell
shopify app deploy
```
## Lên shopify app kiểm tra lại url đã nhận chưa nếu có lỗi

### CLI 
https://shopify.dev/docs/apps/tools/cli/commands#deploy

Logout:
```shell
shopify auth logout
```

View info:
```shell
npm run shopify app info
```







### Local Development

Connect with app and store local của mình để test, làm theo hướng dẫn khi run dev: enable theme app extension, enable app embed in the theme, steps:

Step1: Pull env by app local of partner
```shell
npm run shopify app env pull
```

Step 2: run app
```shell
npm i
npm run dev (npm run dev -- --reset)
```

Step 3: run storefront:
```shell
cd storefront
npm i
npm run dev
```

### Run local faster

Thay step 3 ở trên: npm run dev => npm run serve
Sử dụng url này để gán vào cdn script/style tong app_embed_block.liquid file

### Deploy

Build theme app extension:

```shell
npm run shopify app env pull
npm run deploy
```

