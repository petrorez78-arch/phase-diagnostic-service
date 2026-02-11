# Phase Diagnostic Service - TODO

## Database & Schema
- [x] Create phase_context table for storing diagnostic results
- [x] Create chat_history table for conversation persistence
- [x] Create stock_searches table for tracking user searches
- [x] Create diagnostic_snapshots table for historical data

## Backend Services
- [x] Implement MOEX API client (search, market data, history)
- [x] Implement Smart-lab financial data scraper
- [x] Implement phase diagnostic calculation engine (S-index, vS, aS)
- [x] Implement index calculators (IFund, IMarketGap, IStruct, IVola)
- [x] Implement weak signals detection logic
- [x] Implement rhetoric pressure computation for news sentiment
- [x] Integrate OpenAI LLM for AI agent interpretation (Russian language)
- [x] Implement memory buffer for chat context persistence
- [ ] Create webhook endpoint for n8n workflow trigger

## Frontend UI
- [x] Design clean, functional layout for financial data
- [x] Implement stock search interface (company name/ticker)
- [x] Build results dashboard with company info and phase classification
- [x] Create visualization components for indices and charts
- [x] Implement weak signals display
- [x] Build chat interface for AI agent interaction
- [ ] Add historical data view and trend analysis

## Integration & Testing
- [ ] Set up n8n workflow connection via webhook
- [ ] Test MOEX API integration
- [ ] Test Smart-lab data scraping
- [x] Test phase calculation accuracy (vitest)
- [ ] Test AI agent responses in Russian
- [ ] Test database persistence and chat history
- [ ] End-to-end workflow testing

## Deployment & Optimization
- [ ] Optimize API response times
- [ ] Add error handling and user feedback
- [ ] Performance testing with multiple concurrent requests
- [ ] Final deployment and monitoring setup
