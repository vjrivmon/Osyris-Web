# 🎣 Web Improvement Context Hook

## 🎯 **Purpose**
Automatic context gathering system that triggers during web improvement tasks to collect comprehensive system state and prepare context for specialized agents.

## 🔄 **Auto-Activation Triggers**

### 📝 **Content Management Triggers**
- Page editing requests
- Content updates or modifications
- Image integration tasks
- SEO optimization requests
- Publishing workflow activities

### 🖼️ **Media Management Triggers**
- Upload system interactions
- Gallery management tasks
- Image picker usage
- File management operations
- Media optimization requests

### 🎨 **UI/UX Improvement Triggers**
- Design system updates
- Component modifications
- Layout adjustments
- Responsive design fixes
- User experience enhancements

## 📊 **Context Collection Framework**

### 1. **API Connectivity Assessment**
```bash
# Check API endpoints
curl -X GET "http://localhost:5000/api/paginas" -H "Authorization: Bearer TOKEN"
curl -X GET "http://localhost:5000/api/uploads" -H "Authorization: Bearer TOKEN"

# Response Analysis:
- Connection status: ✅/❌
- Data availability: ✅/❌
- Authentication: ✅/❌
- Response time: [ms]
```

### 2. **Page Management System Status**
```typescript
// Editor Status Check
- Admin page editor: /app/admin/pages/page.tsx
- Component functionality: ✅/❌
- Auto-save operation: ✅/❌
- Preview system: ✅/❌
- Markdown toolbar: ✅/❌
```

### 3. **Upload System Verification**
```javascript
// Upload Controller Analysis
- Local SQLite mode: ✅/❌
- Supabase integration: ✅/❌
- File processing: ✅/❌
- Gallery integration: ✅/❌
- Drag-and-drop: ✅/❌
```

### 4. **Current Page Data Snapshot**
```json
{
  "totalPages": 13,
  "pageTypes": ["secciones", "admin", "general"],
  "lastUpdate": "timestamp",
  "publishedPages": "count",
  "draftPages": "count",
  "archivedPages": "count"
}
```

### 5. **Image Integration Status**
```markdown
- Available images: [count]
- Image picker functionality: ✅/❌
- Upload endpoint status: ✅/❌
- File size limits: [MB]
- Supported formats: [list]
- Storage mode: local/supabase
```

## 🔧 **Context Gathering Procedure**

### Phase 1: **System Health Check** (10 seconds)
```bash
# Quick connectivity test
npm run health-check 2>/dev/null || echo "Health check failed"

# Port availability
netstat -tulpn | grep -E ':(3000|5000)' || echo "Ports not available"

# Process status
ps aux | grep -E '(next|nodemon)' | grep -v grep || echo "Services not running"
```

### Phase 2: **API Response Analysis** (15 seconds)
```javascript
// Automated API testing
const endpoints = [
  '/api/paginas',
  '/api/uploads',
  '/api/auth/verify',
  '/api/usuarios'
];

endpoints.forEach(async (endpoint) => {
  // Test response time and data structure
  // Log: endpoint, status, responseTime, dataStructure
});
```

### Phase 3: **Component Functionality Test** (20 seconds)
```typescript
// React component status
const components = [
  'ImagePicker',
  'PageEditor',
  'MarkdownToolbar',
  'PreviewSystem'
];

// Verify: mounting, props, events, state management
```

### Phase 4: **Database Content Analysis** (10 seconds)
```sql
-- Page content statistics
SELECT
  COUNT(*) as total_pages,
  COUNT(CASE WHEN estado = 'publicada' THEN 1 END) as published,
  COUNT(CASE WHEN estado = 'borrador' THEN 1 END) as drafts,
  MAX(fecha_actualizacion) as last_update
FROM paginas;

-- Upload statistics
SELECT
  COUNT(*) as total_files,
  SUM(tamaño_archivo) as total_size,
  COUNT(CASE WHEN tipo_archivo LIKE 'image%' THEN 1 END) as images
FROM uploaded_files;
```

## 📋 **Context Report Template**

### 🚨 **CRITICAL STATUS**
```markdown
## System Status: [OPERATIONAL/DEGRADED/CRITICAL]

### 🔌 Connectivity
- Backend API: [STATUS] - [RESPONSE_TIME]ms
- Database: [STATUS] - [CONNECTION_STATE]
- Authentication: [STATUS] - [TOKEN_VALID]

### 📝 Page Management
- Editor Interface: [FUNCTIONAL/ISSUES]
- Auto-save: [ENABLED/DISABLED/ERROR]
- Preview System: [WORKING/BROKEN]
- Total Pages: [COUNT] ([PUBLISHED]/[DRAFTS])

### 🖼️ Media System
- Upload Controller: [WORKING/ERROR]
- Image Gallery: [LOADED/EMPTY/ERROR] - [COUNT] files
- Storage Mode: [LOCAL/SUPABASE]
- Last Upload: [TIMESTAMP]

### ⚠️ Issues Detected
- [ISSUE 1]: [DESCRIPTION] - [SEVERITY]
- [ISSUE 2]: [DESCRIPTION] - [SEVERITY]

### 🎯 Recommended Actions
1. [ACTION 1] - [PRIORITY]
2. [ACTION 2] - [PRIORITY]
```

## 🤖 **Agent Activation Recommendations**

### 📄 **Page Management Tasks** → `page-management-specialist`
```markdown
Triggers:
- Content editing requests
- Image integration needs
- SEO optimization
- Publishing workflows

Context Provided:
- Current page data structure
- Editor functionality status
- Upload system capability
- Available media files
```

### 🔧 **Technical Issues** → `database-integration-specialist`
```markdown
Triggers:
- API connectivity problems
- Database errors
- Authentication failures
- Data synchronization issues

Context Provided:
- Connection diagnostics
- Error logs
- Performance metrics
- System resource status
```

### 🎨 **UI/UX Improvements** → `osyris-ui-ux-analyzer`
```markdown
Triggers:
- Design system updates
- Component improvements
- User experience issues
- Responsive design fixes

Context Provided:
- Current component state
- Design system status
- User interaction patterns
- Performance metrics
```

## 🔄 **Continuous Monitoring**

### 📊 **Real-Time Metrics**
- API response times
- Upload success rates
- Editor performance
- User interaction patterns

### 🚨 **Alert Thresholds**
- API response > 2000ms
- Upload failure rate > 5%
- Editor auto-save failures
- Authentication token expiry

### 📈 **Performance Tracking**
- Page load times
- Image optimization ratios
- Content update frequency
- System resource usage

## 🎯 **Success Indicators**

### ✅ **Optimal State**
- All APIs responding < 500ms
- 100% upload success rate
- Editor auto-save functional
- All preview modes working
- Image integration seamless

### 📋 **Action Items Generated**
- Specific improvement recommendations
- Priority-ranked task list
- Agent assignment suggestions
- Performance optimization targets

---

*This context hook ensures that every web improvement task begins with complete situational awareness and optimal agent assignment for maximum efficiency and success.*