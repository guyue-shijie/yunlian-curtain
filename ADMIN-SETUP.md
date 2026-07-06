# 后台部署配置

后台地址：

```text
https://yunlian-curtain.pages.dev/admin/
```

## Cloudflare 必填配置

后台使用 Cloudflare Pages Functions + KV，不需要单独服务器。

1. 进入 Cloudflare Dashboard。
2. 打开 `存储与数据库` -> `KV`，创建一个命名空间，例如 `yunlian_curtain_content`。
3. 打开 Pages 项目 `yunlian-curtain`。
4. 进入 `设置` -> `函数` -> `KV 命名空间绑定`。
5. 添加绑定：

```text
变量名称：SITE_CONTENT
KV 命名空间：刚创建的 yunlian_curtain_content
```

6. 进入 `设置` -> `环境变量`，添加生产环境变量：

```text
ADMIN_PASSWORD=你自己的强密码
SESSION_SECRET=至少 24 位的随机字符串
```

7. 保存后重新部署一次项目。

## 可编辑内容

- 门店名称、电话、微信、地址、营业时间、地图链接
- SEO 标题、搜索摘要、分享图片
- 首屏标题、说明、图片
- 服务项、案例、价格套餐、咨询流程
- 底部转化文案和页脚说明

## 注意

- 不要把 `ADMIN_PASSWORD` 写进 GitHub 文件，只放在 Cloudflare 环境变量里。
- 前台 `/api/site` 有 60 秒缓存，保存后最多等 1 分钟刷新。
- `pages.dev` 在微信里仍可能被拦截；绑定自己的域名更稳。
