
# Restaurant Solutions Platform

Multi-tenant restaurant ordering and operations platform with a separate Solutions administration site.

## Features

- Restaurant Solutions landing page and platform owner workspace at `/solutions`.
- Separate restaurant tenants such as `/nomnosh`, `/cheezious`, and newly approved restaurant slugs.
- Tenant-isolated products, categories, orders, customers, locations, inventory, staff, and settings.
- Platform applications with Pending, Active, Paid, and Trial approval states.
- Restaurant access is blocked while an application is Pending or Rejected.
- New restaurants start completely empty except for their own owner account.
- Owner, admin, staff, and customer account permissions.
- Team management, archived members, product/category management, orders, analytics, and storefront controls.
- Non-protected tenants can be permanently removed with their tenant data.

## Local development

Install dependencies and start the local server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The platform site is available at `/solutions`. Restaurant storefronts use their tenant slug, for example `/nomnosh`.

## Approval flow

1. A restaurant owner submits an application through the Solutions site.
2. The Solutions administrator changes the application to `Active`, `Paid`, or `Trial`.
3. A private tenant is created with no copied restaurant data.
4. The owner completes restaurant setup and opens the tenant workspace.
5. Changing the application back to `Pending` blocks storefront and dashboard access.

## GitHub

```bash
git status
git add .
git commit -m "Update restaurant platform and tenant access"
git branch -M main
git push -u origin main
```

If no remote exists yet:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
