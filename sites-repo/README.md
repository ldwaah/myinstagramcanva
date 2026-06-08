# myinstagramcanva-sites

Central GitHub monorepo for tenant website files. Each folder under `sites/{username}/` is managed by the platform API.

Structure:

```
sites/
  khiagovisuals/
    index.html
    site.json
    css/style.css
    js/main.js
```

Push to `main` triggers `.github/workflows/deploy.yml` to sync changed folders to R2/CDN.
