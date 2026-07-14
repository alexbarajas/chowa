#!/usr/bin/env bash
# Starts both the backend (FastAPI) and frontend (Next.js) together.
# Ctrl+C stops both.
set -e

trap 'kill 0' EXIT

(cd backend && source venv/bin/activate && uvicorn app.main:app --reload) &
(cd frontend && npm run dev) &

wait