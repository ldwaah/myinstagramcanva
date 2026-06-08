# Instagram Meta App Review Checklist

## Prerequisites for OAuth (Phase 5)

1. Create a Meta app at https://developers.facebook.com/
2. Add **Instagram** product → **API setup with Instagram login**
3. Configure OAuth redirect: `https://myinstagramcanva.com/api/auth/instagram/callback`
4. Request **Advanced Access** for `instagram_business_basic`
5. Complete **Business Verification**
6. Submit App Review screencast showing:
   - User connects Instagram Business/Creator account
   - Platform reads profile + media to generate website

## Environment variables

```
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=https://myinstagramcanva.com/api/auth/instagram/callback
```

## Fallback (no OAuth)

Username-only ingest uses public profile endpoint server-side. Document user consent in Terms of Service.
