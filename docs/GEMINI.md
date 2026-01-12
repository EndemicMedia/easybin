# GEMINI.md

## Project Overview

This project is a Progressive Web App (PWA) called **EasyBin**, designed to help users correctly sort waste for recycling. The application uses a device's camera to take a picture of an item, then sends the image to an AI service (Puter.ai) for analysis. The AI identifies the item and determines the appropriate disposal bin (recycling, organic, general waste, etc.) based on regional recycling rules.

The application is built using vanilla HTML, CSS, and JavaScript. It supports multiple languages and regions, and includes features like offline functionality and a history of scanned items.

## Building and Running

The project is a client-side application and does not require a build step.

### Running Locally

To run the application locally for development, you can use a simple HTTP server. The `package.json` file provides a `serve` script for this purpose:

```bash
npm run serve
```

This will start a server on port 5050. You can then access the application at `http://localhost:5050`.

### Testing

The project has two types of tests:

1.  **Unit/Integration Tests:** These are run with Jest. You can run them with the following command:

    ```bash
    npm test
    ```

2.  **End-to-End (E2E) Tests:** These are run with Playwright. You can run them with the following command:

    ```bash
    npm run test:e2e
    ```

To run all tests, you can use:

```bash
npm run test:all
```

## Development Conventions

*   **Code Style:** The project uses a standard JavaScript style. There is no linter configured, but the code is generally well-formatted.
*   **Testing:** The project has a comprehensive test suite. New features should be accompanied by tests.
    *   Unit and integration tests are located in the `tests/` directory and have a `.test.js` extension.
    *   E2E tests are also in the `tests/` directory and have a `.spec.js` extension.
*   **Dependencies:** The project has minimal dependencies, managed with npm. The main dependencies are Jest and Playwright for testing.
*   **AI Integration:** The AI integration is handled in `app.js` through the `puter.ai.chat` function. The prompt sent to the AI is constructed in the `scanButton.onclick` event handler.
