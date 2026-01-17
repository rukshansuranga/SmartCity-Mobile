# Comment Testing Implementation Checklist

## ✅ Completed Tasks

### Core Implementation

- [x] Created reusable `comment-flow.yaml` for testing comments
- [x] Added testIDs to CommentManager component (`comment-button`)
- [x] Added testIDs to CommentModal component (`close-comment-modal`)
- [x] Added testIDs to CommentSection component (`comment-input`, `send-comment-button`, `cancel-comment-button`)
- [x] Updated placeholder text to match test expectations ("Write a comment...")

### Example Flows

- [x] Created `general-complains-with-comments-flow.yaml`
- [x] Created `lightpost-complains-with-comments-flow.yaml`
- [x] Both flows successfully integrate `runFlow: comment-flow.yaml`

### Documentation

- [x] Created QUICK_START_COMMENTS.md (3-step guide)
- [x] Created COMMENT_FLOW_GUIDE.md (detailed guide)
- [x] Created ARCHITECTURE.md (visual diagrams)
- [x] Created COMMENT_TESTING_SUMMARY.md (implementation summary)
- [x] Updated maestro/README.md with new documentation links
- [x] Updated test coverage checklist

### Test Suites

- [x] Updated regression-suite.yaml to include comment flows
- [x] Test suite includes both general and lightpost with comments

## 🎯 Ready to Use

You can now:

1. **Run the comment flow standalone** (if on correct screen):

   ```bash
   maestro test maestro/flows/comment-flow.yaml
   ```

2. **Run example flows with comments**:

   ```bash
   maestro test maestro/flows/general-complains-with-comments-flow.yaml
   maestro test maestro/flows/lightpost-complains-with-comments-flow.yaml
   ```

3. **Add comments to ANY new flow** with just one line:
   ```yaml
   - runFlow: comment-flow.yaml
   ```

## 📋 Future Enhancements (Optional)

### Additional Flows

- [ ] Create project-complains-with-comments-flow.yaml
- [ ] Create garbage-complains-with-comments-flow.yaml
- [ ] Add comment testing to any other entity that supports comments

### Advanced Comment Testing

- [ ] Create comment-edit-flow.yaml (test editing comments)
- [ ] Create comment-delete-flow.yaml (test deleting comments)
- [ ] Create comment-reply-flow.yaml (if reply feature exists)
- [ ] Create comment-validation-flow.yaml (test error cases)

### Performance Testing

- [ ] Test with many comments (scroll performance)
- [ ] Test rapid comment submission
- [ ] Test offline comment behavior

### Accessibility Testing

- [ ] Add accessibility labels to all interactive elements
- [ ] Test screen reader compatibility
- [ ] Test with large text sizes

## 🚀 How to Extend

### Adding Comments to a New Feature

1. **Ensure CommentManager is on the detail screen**

   ```tsx
   <CommentManager
     entityId={yourEntity.id}
     entityType={EntityType.YourType}
     isPrivate={false}
   />
   ```

2. **Create your test flow** (or update existing):

   ```yaml
   # ... your test setup ...
   - tapOn: "Your Entity"
   - extendedWaitUntil:
       visible: "Details"
   - runFlow: comment-flow.yaml
   ```

3. **Run your test**:
   ```bash
   maestro test maestro/flows/your-flow.yaml
   ```

### Creating Variant Comment Flows

```yaml
# comment-private-flow.yaml - test private comments
- runFlow: comment-flow.yaml
- assertVisible: "Private"

# comment-bulk-flow.yaml - add multiple comments
- runFlow: comment-flow.yaml
- runFlow: comment-flow.yaml
- runFlow: comment-flow.yaml
- assertVisible: "3 comments"
```

## 📊 Test Coverage

| Feature            | Coverage | Flow              |
| ------------------ | -------- | ----------------- |
| Open modal         | ✅       | comment-flow.yaml |
| Add comment        | ✅       | comment-flow.yaml |
| View comments      | ✅       | comment-flow.yaml |
| Close modal        | ✅       | comment-flow.yaml |
| Edit comment       | 🔄       | (manual testing)  |
| Delete comment     | 🔄       | (manual testing)  |
| Reply to comment   | ⏸️       | (feature TBD)     |
| Comment validation | ⏸️       | (future)          |

## 🔧 Maintenance

### When to Update comment-flow.yaml

Update the reusable flow if:

- Comment UI changes (new buttons, fields)
- New testIDs are added
- Flow steps need modification
- Better assertions are needed

**Important**: When you update `comment-flow.yaml`, ALL flows using it automatically get the updates! 🎉

### When to Update Component TestIDs

If you modify component files, ensure testIDs remain:

- `comment-button` in CommentManager
- `comment-input` in CommentSection
- `send-comment-button` in CommentSection
- `close-comment-modal` in CommentModal

## 📝 Notes

### Design Decisions

1. **Reusability**: One flow works for all entities
2. **Modularity**: Easy to mix and match with other flows
3. **Maintainability**: Update once, apply everywhere
4. **Simplicity**: One line integration

### Best Practices Followed

- ✅ Descriptive testIDs
- ✅ Clear assertions
- ✅ Screenshots at key steps
- ✅ Proper wait conditions
- ✅ Comprehensive documentation

## 🎉 Success!

Your comment testing infrastructure is now:

- **Reusable** across all features
- **Documented** with multiple guides
- **Tested** with working examples
- **Maintainable** with single source of truth
- **Extensible** for future features

Start adding `runFlow: comment-flow.yaml` to your tests! 🚀
