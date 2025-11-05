# Keycloak UserInfo Response Refactoring

## Overview

Updated the application to handle the new Keycloak userInfo endpoint response structure that follows standard OIDC (OpenID Connect) claims.

## Changes Made

### 1. New Type Definition

**File:** `types/index.ts`

Added `KeycloakUserInfo` type to properly type the userInfo response:

```typescript
export type KeycloakUserInfo = {
  sub: string; // User ID (was: userInfo.id)
  email_verified: boolean;
  name: string; // Full name
  mobile?: string;
  councils: string[]; // Array of council names
  preferred_username: string; // Username
  given_name: string; // First name
  family_name: string; // Last name
  email: string;
};
```

### 2. Auth Store Updates

**File:** `stores/authStore.ts`

- Changed `userInfo` type from `any` to `KeycloakUserInfo`
- Updated imports to include `KeycloakUserInfo` from `@/types`
- Updated `logIn` method signature to accept `KeycloakUserInfo` type

### 3. Authentication Flow Updates

**File:** `app/auth.tsx`

#### Login Flow

- Updated council extraction to map from string array to Council type objects:
  ```typescript
  const councilNames: string[] = userInfo.councils || [];
  const councils: Council[] = councilNames.map((councilName) => ({
    value: councilName,
    label: councilName,
  }));
  ```

#### Registration Flow

- Applied the same council extraction logic
- Updated the success alert to remove reference to non-existent `project_roles` property
- Added fallback for optional `mobile` field: `mobile: userInfo.mobile || ""`

### 4. User Edit Page Updates

**File:** `app/editUser.tsx`

- Added null check for `userInfo?.preferred_username` before calling `fetchUser`
- Updated useEffect dependency to include userInfo
- Added ESLint disable comment for exhaustive-deps warning

### 5. Complain List Updates

**File:** `app/(complains)/general/GeneralComplainList.tsx`

- Changed ownership check from `userInfo.id === item.clientId` to `userInfo.sub === item.clientId`
- This aligns with the new OIDC standard where `sub` is the user identifier

## Property Mapping Reference

| Old Structure        | New Structure (OIDC Standard) | Notes                        |
| -------------------- | ----------------------------- | ---------------------------- |
| `userInfo.id`        | `userInfo.sub`                | User unique identifier       |
| `userInfo.username`  | `userInfo.preferred_username` | Username                     |
| `userInfo.firstName` | `userInfo.given_name`         | First name                   |
| `userInfo.lastName`  | `userInfo.family_name`        | Last name                    |
| `userInfo.email`     | `userInfo.email`              | Email (unchanged)            |
| `userInfo.mobile`    | `userInfo.mobile`             | Mobile number (custom claim) |
| `userInfo.councils`  | `userInfo.councils`           | Council array (custom claim) |
| N/A                  | `userInfo.name`               | Full name                    |
| N/A                  | `userInfo.email_verified`     | Email verification status    |

## Verified Usage Across Codebase

The following files correctly use `userInfo.sub` and don't require changes:

- `app/editUser.tsx` - Uses `userInfo?.sub` for admin API calls ✅
- `app/(tax)/units.tsx` - Uses `userInfo?.sub` as residentId ✅
- `app/(tax)/summary.tsx` - Uses `userInfo?.sub` as residentId ✅
- `app/(tax)/payment.tsx` - Uses `userInfo?.sub` as residentId ✅
- `app/(complains)/project/ComplainAddModal.tsx` - Uses `userInfo?.sub` as clientId ✅
- `app/(complains)/general/ManageGeneralComplain.tsx` - Uses `userInfo?.sub` as clientId ✅
- `app/(complains)/general/AddGeneralComplain_Refactor.tsx` - Uses `userInfo?.sub` as clientId ✅
- `components/CommentSection.tsx` - Uses `userInfo?.sub` for ownership checks ✅
- `app/_layout.tsx` - Uses `userInfo?.given_name` for display name ✅
- `app/(tax)/payment.tsx` - Uses `userInfo?.name` and `userInfo?.given_name` with fallback ✅

## Testing Checklist

- [ ] Login flow works correctly
- [ ] Registration flow works correctly
- [ ] Council selection works after login
- [ ] User profile edit page loads user data correctly
- [ ] Complain ownership detection works
- [ ] Tax payment uses correct resident ID
- [ ] Comments show correct ownership
- [ ] User display name appears correctly in header

## Example UserInfo Response

```json
{
  "sub": "c8d6a4e8-3b6c-4575-b32e-8a746aab27a9",
  "email_verified": true,
  "name": "lankika edit perera",
  "mobile": "123",
  "councils": ["Mahara", "Gampaha"],
  "preferred_username": "lankika",
  "given_name": "lankika edit",
  "family_name": "perera",
  "email": "lanki@gmail.com"
}
```

## Migration Notes

If you have existing users with stored sessions:

1. Old sessions will continue to work until they expire
2. Upon next login, new userInfo structure will be stored
3. No data migration needed as the auth store will be updated on login

## Related Documentation

- [Keycloak Council Setup](./KEYCLOAK_COUNCIL_SETUP.md)
- [Quick Start Guide](./QUICK_START_GUIDE.md)
