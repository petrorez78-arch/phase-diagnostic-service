# Phase Diagnostic Service - TODO

## Architecture: Web UI + n8n Backend

### Backend (Proxy to n8n)
- [x] Create n8n proxy service that forwards requests to n8n webhook
- [x] Handle request/response transformation
- [x] Implement error handling and logging
- [ ] Cache results in database for history

### Frontend UI
- [x] Create beautiful search interface (company name/ticker)
- [x] Build results dashboard with:
  - [x] Company info (name, ticker, price)
  - [x] Phase classification with visual indicator
  - [x] Indices display (S, vS, aS, IFund, IMarketGap, IStruct, IVola)
  - [x] Charts for indices and dynamics
  - [x] Weak signals display
  - [x] News sentiment analysis
- [x] Build chat interface for AI agent interaction
- [x] Implement message history in UI
- [x] Add loading states and error handling

### Integration
- [x] Test n8n webhook connection
- [x] Verify request/response format
- [ ] Test search functionality (blocked by n8n workflow issue)
- [ ] Test analysis functionality (blocked by n8n workflow issue)
- [ ] Test AI chat functionality (blocked by n8n workflow issue)

### Styling & UX (v1 - Basic)
- [x] Clean, modern design for financial data
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Dark theme with good contrast
- [x] Smooth animations and transitions
- [x] Loading spinners and skeleton screens

### Visual Redesign (v2 - Premium)
- [x] Apply premium dark theme with high contrast colors
- [x] Create GaugeChart component for index visualization
- [x] Create PhaseIndicator component for phase display
- [x] Create SignalCard component for weak signals
- [x] Create ResponseParser utility for extracting structured data
- [x] Redesign Home page with premium financial aesthetic
- [x] Redesign Diagnostics page with chat + results panel layout
- [x] Update ResultsDashboard with rich visualizations (radar, bars, gauges)
- [ ] Test all visual components and save checkpoint

### Deployment
- [ ] Final testing
- [ ] Performance optimization
- [ ] Error messages and user feedback

## Webhook URL Update
- [x] Update n8n webhook URL to test endpoint
- [ ] Test integration with new webhook

## UX Improvements
- [x] Add loading skeleton for chat messages during n8n processing
- [x] Add progress indicator showing estimated time remaining
- [x] Add typing animation while waiting for n8n response

## Visualization Enhancements
- [x] Parse n8n text responses to extract structured data
- [x] Display charts automatically when data is detected
- [x] Add image support in results (if n8n returns image URLs)
- [x] Improve ResponseParser to handle more data formats

## Deployment
- [x] Create deployment guide for self-hosting
- [x] Document GitHub export process
- [x] Document environment variables setup
- [x] Document database migration steps

## New Features (User Requested)
- [x] Add search history (last 10 searches) with quick access buttons
- [x] Add chat scrolling to view previous messages
- [x] Implement persistent chat memory per user in database
- [x] Add PDF export functionality with charts and analysis
- [x] Design and implement enhanced result visualization

## Scrolling Fix
- [x] Fix results panel scrolling to allow viewing all content

## User Requested Improvements (v3)
- [x] Fix PDF export to work with text-only n8n responses
- [x] Send chat history to n8n for context-aware AI responses
- [x] Implement mobile responsive design (chat fullscreen, results in modal)
- [x] Add animated and interactive visualization for calculations
- [x] Add timeline visualization for phase history
- [x] Add comparative charts (current vs average values)

## Bug Fixes (User Reported)
- [x] Fix results panel scrolling (broken after mobile modal addition)
- [x] Remove screen darkening effect
- [x] Ensure all charts and visualizations display correctly

## Scale Adjustment (User Requested)
- [x] Change all chart scales from 0-100 to 0-1 for correct index display
- [x] Update GaugeChart component (max from 100 to 1)
- [x] Update RadarChart domain (from [0, 100] to [0, 1])
- [x] Update BarChart domain (from [0, 100] to [0, 1])
- [x] Update ComparisonChart domain (from [0, 100] to [0, 1])
- [x] Update IndexHeatmap color thresholds (from 70/40 to 0.7/0.4)

## New Features (User Requested)
- [x] Stabilize visualization output format (ensure all charts always render)
- [x] Implement chat history persistence in database
- [x] Add chat list UI showing all user's previous conversations
- [x] Add ability to load and continue previous chat sessions
- [x] Implement follow-up questions feature (ask questions about specific analysis results)
- [x] Add context awareness for follow-up questions (send previous analysis to n8n)

## Bug Fix (User Reported)
- [x] Fix parser to use real n8n data instead of always defaulting to 0.5 for indices

## Enhancement (User Requested)
- [x] Add JSON response parsing to properly display structured data from n8n
- [x] Extract data from JSON fields (Компания, Фаза, Слабые сигналы, etc.)
- [x] Map JSON structure to visualization components
