# Quick Start: Adding Comments to Your Test Flow

## 3-Step Integration

### Step 1: Navigate to Entity Detail View

Make sure you're on a screen that shows the comment button:

```yaml
# Open the entity you just created
- tapOn: "Your Entity Name"
- extendedWaitUntil:
    visible: "Entity Details"
    timeout: 10000
```

### Step 2: Run the Comment Flow

Add this single line:

```yaml
- runFlow: comment-flow.yaml
```

### Step 3: Continue Your Test

Return to your main flow:

```yaml
- tapOn:
    id: "back-button"
- extendedWaitUntil:
    visible: "Your List Screen"
    timeout: 10000
```

## Complete Example

```yaml
---
appId: com.rukshansuranga.smartcity
name: My Feature with Comments
---
# ... your authentication and navigation ...

# Create your entity
- tapOn: "Add"
- tapOn: "Enter title"
- inputText: "My Test Entity"
- tapOn: "Submit"

# Open the entity
- tapOn: "My Test Entity"
- extendedWaitUntil:
    visible: "Details"
    timeout: 10000

# ⭐ Test comments - just one line!
- runFlow: comment-flow.yaml

# Return to list
- tapOn:
    id: "back-button"
```

## What Gets Tested

When you add `runFlow: comment-flow.yaml`, you automatically test:

✅ Opening comment modal  
✅ Entering comment text  
✅ Submitting comment  
✅ Viewing comment in list  
✅ Closing modal  
✅ 5 screenshots captured

## Real Examples

### General Complains

See: `general-complains-with-comments-flow.yaml`

### Light Post Complains

See: `lightpost-complains-with-comments-flow.yaml`

### Your Feature

Copy the pattern above!

## Run Your Test

```bash
# Test your new flow
maestro test maestro/flows/your-flow.yaml

# Run all tests
maestro test maestro/suites/regression-suite.yaml
```

## Need Help?

- **Full Guide**: See `COMMENT_FLOW_GUIDE.md`
- **Examples**: Check existing `-with-comments-flow.yaml` files
- **Troubleshooting**: See guide for common issues

---

**That's it!** One line adds complete comment testing to any flow. 🚀
