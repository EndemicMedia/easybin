# Vision API Tester

Consolidated testing utility for all vision API providers (OpenRouter, Google Gemini, etc.)

## Installation

Requires API keys in `.env`:
```bash
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_GEMINI_API_KEY=AIzaSy...
```

## Usage

### List Available Models

```bash
# List free OpenRouter vision models
node vision-api-tester.js list openrouter

# List Gemini vision models
node vision-api-tester.js list gemini
```

### Test Specific Model

```bash
# Test OpenRouter model
node vision-api-tester.js test openrouter allenai/molmo-2-8b:free

# Test Gemini model
node vision-api-tester.js test gemini models/gemini-flash-lite-latest
```

### Speed Comparison

```bash
# Compare Gemini models by speed
node vision-api-tester.js speed gemini
```

## Features

- **Model Discovery**: List all available vision models for each provider
- **Individual Testing**: Test any model with sample image
- **Speed Benchmarking**: Compare response times across models
- **Automatic Timeout Handling**: Prevents hanging on slow/failed requests
- **Result Formatting**: Clear output with timing and response preview

## Output

Results show:
- ✅/❌ Success/failure status
- Response time in milliseconds
- Model name and ID
- Preview of AI response (first 200 chars)

## Examples

```bash
# Discovery workflow
node vision-api-tester.js list gemini
node vision-api-tester.js test gemini models/gemini-flash-lite-latest
node vision-api-tester.js speed gemini

# Find best OpenRouter model
node vision-api-tester.js list openrouter
node vision-api-tester.js test openrouter google/gemma-3-12b-it:free
```
