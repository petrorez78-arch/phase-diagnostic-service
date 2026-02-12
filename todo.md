# Phase Diagnostic Service - TODO

## Architecture: Web UI + n8n Backend

### Backend (Proxy to n8n)
- [ ] Create n8n proxy service that forwards requests to n8n webhook
- [ ] Handle request/response transformation
- [ ] Implement error handling and logging
- [ ] Cache results in database for history

### Frontend UI
- [ ] Create beautiful search interface (company name/ticker)
- [ ] Build results dashboard with:
  - [ ] Company info (name, ticker, price)
  - [ ] Phase classification with visual indicator
  - [ ] Indices display (S, vS, aS, IFund, IMarketGap, IStruct, IVola)
  - [ ] Charts for indices and dynamics
  - [ ] Weak signals display
  - [ ] News sentiment analysis
- [ ] Build chat interface for AI agent interaction
- [ ] Implement message history in UI
- [ ] Add loading states and error handling

### Integration
- [ ] Test n8n webhook connection
- [ ] Verify request/response format
- [ ] Test search functionality
- [ ] Test analysis functionality
- [ ] Test AI chat functionality

### Styling & UX
- [ ] Clean, modern design for financial data
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] Dark theme with good contrast
- [ ] Smooth animations and transitions
- [ ] Loading spinners and skeleton screens

### Deployment
- [ ] Final testing
- [ ] Performance optimization
- [ ] Error messages and user feedback
