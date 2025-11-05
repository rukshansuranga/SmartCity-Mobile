# Keycloak Configuration Guide for Council Selection

## 🎯 Overview

This guide explains how to configure Keycloak to include council information in the user's token and userInfo endpoint.

---

## 📋 Step 1: Add Custom User Attribute

### **Option A: Via Keycloak Admin Console (Manual)**

1. Login to Keycloak Admin Console
2. Navigate to: **Users** → Select a user → **Attributes** tab
3. Add new attribute:
   - **Key**: `councils`
   - **Value**: `[{"value":"colombo","label":"Colombo Municipal Council"}]`

**Important**: The value must be valid JSON array format.

### **Option B: Via API (Programmatic)**

```bash
# Get admin token
curl -X POST \
  https://your-keycloak.com/realms/smartcity/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials' \
  -d 'client_id=smartcity-admin' \
  -d 'client_secret=YOUR_SECRET'

# Update user attributes
curl -X PUT \
  https://your-keycloak.com/admin/realms/smartcity/users/{USER_ID} \
  -H 'Authorization: Bearer {ADMIN_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "attributes": {
      "councils": ["[{\"value\":\"colombo\",\"label\":\"Colombo Municipal Council\"}]"]
    }
  }'
```

---

## 📋 Step 2: Configure Client Mappers

### **Add User Attribute Mapper to UserInfo**

1. Navigate to: **Clients** → **smartcity-mobile** → **Client Scopes** tab
2. Click on the scope (e.g., `smartcity-mobile-dedicated`)
3. Go to **Mappers** tab → **Add mapper** → **By configuration**
4. Select **User Attribute**

#### **Mapper Configuration:**

- **Name**: `councils-mapper`
- **User Attribute**: `councils`
- **Token Claim Name**: `councils`
- **Claim JSON Type**: `JSON`
- **Add to ID token**: `ON`
- **Add to access token**: `OFF` (optional - keeps token smaller)
- **Add to userinfo**: `ON` ✅ **IMPORTANT**
- **Multivalued**: `OFF`

---

## 📋 Step 3: Test Configuration

### **Test UserInfo Endpoint**

```bash
# Get access token first (after login)
ACCESS_TOKEN="your_access_token_here"

# Call userinfo endpoint
curl -X GET \
  https://your-keycloak.com/realms/smartcity/protocol/openid-connect/userinfo \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### **Expected Response:**

```json
{
  "sub": "user-id-123",
  "email_verified": true,
  "preferred_username": "john.doe",
  "given_name": "John",
  "family_name": "Doe",
  "email": "john@example.com",
  "councils": [
    {
      "value": "colombo",
      "label": "Colombo Municipal Council"
    },
    {
      "value": "kandy",
      "label": "Kandy Municipal Council"
    }
  ]
}
```

---

## 📋 Step 4: Bulk User Import (Optional)

If you need to add councils to many users at once:

### **Create JSON file** (`users.json`):

```json
[
  {
    "username": "user1",
    "email": "user1@example.com",
    "enabled": true,
    "attributes": {
      "councils": [
        "[{\"value\":\"colombo\",\"label\":\"Colombo Municipal Council\"}]"
      ]
    }
  },
  {
    "username": "user2",
    "email": "user2@example.com",
    "enabled": true,
    "attributes": {
      "councils": [
        "[{\"value\":\"kandy\",\"label\":\"Kandy Municipal Council\"},{\"value\":\"colombo\",\"label\":\"Colombo Municipal Council\"}]"
      ]
    }
  }
]
```

### **Import via Keycloak Admin Console:**

1. Navigate to: **Users** → **Import**
2. Upload `users.json`
3. Select options (Overwrite, Skip if exists, etc.)
4. Click **Import**

---

## 🔧 Alternative: Use Groups Instead of Attributes

If you prefer managing councils via Keycloak Groups:

### **Setup:**

1. Create groups: `/councils/colombo`, `/councils/kandy`
2. Add users to appropriate groups
3. Create **Group Membership** mapper
4. Map group names to `councils` claim

### **Mapper Configuration:**

- **Name**: `councils-group-mapper`
- **Mapper Type**: `Group Membership`
- **Token Claim Name**: `councils`
- **Full group path**: `OFF`
- **Add to userinfo**: `ON`

### **Transform in Mobile App:**

You'll need to transform group names to the expected format:

```typescript
// In signIn.tsx
const councilGroups = userInfo.councils || [];
const councils: Council[] = councilGroups.map((group: string) => ({
  value: group.toLowerCase(),
  label: group.charAt(0).toUpperCase() + group.slice(1) + " Municipal Council",
}));
```

---

## 🎯 Council Data Format

### **Single Council:**

```json
{
  "councils": [{ "value": "colombo", "label": "Colombo Municipal Council" }]
}
```

### **Multiple Councils:**

```json
{
  "councils": [
    { "value": "colombo", "label": "Colombo Municipal Council" },
    { "value": "kandy", "label": "Kandy Municipal Council" },
    { "value": "galle", "label": "Galle Municipal Council" }
  ]
}
```

### **Field Descriptions:**

- **`value`**: Unique identifier (lowercase, no spaces) - sent to backend
- **`label`**: Display name (user-friendly) - shown in UI

---

## 🐛 Troubleshooting

### **Issue: Councils not appearing in userInfo**

**Check:**

1. ✅ Mapper is configured correctly
2. ✅ "Add to userinfo" is enabled
3. ✅ User has the attribute set
4. ✅ Attribute value is valid JSON
5. ✅ Client scope includes the mapper

### **Issue: JSON parsing error**

**Fix:**
Ensure the councils value is properly escaped JSON:

```json
// ✅ Correct
["[{\"value\":\"colombo\",\"label\":\"Colombo\"}]"]

// ❌ Wrong
["[{'value':'colombo','label':'Colombo'}]"]
```

### **Issue: Councils appear as string instead of array**

**Fix:**
Set **Claim JSON Type** to `JSON` in mapper configuration.

---

## 📚 Additional Resources

- [Keycloak Protocol Mappers](https://www.keycloak.org/docs/latest/server_admin/#_protocol-mappers)
- [User Attributes](https://www.keycloak.org/docs/latest/server_admin/#user-attributes)
- [Client Scopes](https://www.keycloak.org/docs/latest/server_admin/#_client_scopes)

---

## ✅ Verification Checklist

- [ ] Custom attribute `councils` added to test user
- [ ] Mapper configured and enabled
- [ ] UserInfo endpoint returns councils array
- [ ] Mobile app receives councils correctly
- [ ] Council selection works in app
- [ ] Backend receives `X-Council-Id` header

---

## 🎉 Done!

Your Keycloak is now configured to provide council information to the mobile app!
