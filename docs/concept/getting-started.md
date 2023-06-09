---
sidebar_position: 1
---

# Getting Started

**⚠️ `ai-utils.js` is currently in its initial experimental phase. Until version 0.1 there may be breaking changes in each release.**

## Installation

```bash
npm install ai-utils.js
```

## API Keys

You can provide API keys for the different [providers](/integration/model-provider/) using environment variables (e.g., `OPENAI_API_KEY`) or by passing them in as options to the model constructors.

## Requirements

- [Node.js](https://nodejs.org/en/download/) version 18 or above. `ai-utils.js` uses the Node.js fetch API and parts of the Web Streams API, which were not enabled by default before Node 18.
