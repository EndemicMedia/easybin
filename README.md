# EasyBin: Smart Waste Separator

EasyBin is a progressive web application that uses AI to help users properly sort waste for recycling. Point your camera at any item, and EasyBin will identify it and provide sorting instructions based on your region's recycling rules.

## Key Features
- **AI-Powered Identification**: Uses AI to analyze items in photos and determine proper disposal methods
- **Multi-Region Support**: Adapts sorting rules for United States, Germany, Italy, and Brazil
- **Multi-Language Interface**: Supports English, German, Italian, and Portuguese (Brazil)
- **Offline Functionality**: Works as a Progressive Web App (PWA) with offline capabilities
- **History Tracking**: Saves your scan history with images for reference

## Installation
EasyBin is a Progressive Web App (PWA) that can be installed directly from the browser:

1. Open EasyBin in a modern web browser (Chrome, Firefox, Safari, Edge)
2. When prompted, click "Install App" or use your browser's install option
3. The app will be available on your home screen or desktop

## Usage
1. **Select Your Language and Region**: Choose your preferred language and region from the dropdown menus
2. **Allow Camera Access**: Grant permission for the camera when prompted
3. **Scan an Item**: Point your camera at an item and click "Identify Item"
4. **View Results**: See sorting instructions, confidence level, and additional information
5. **Take Action**: Follow the provided instructions for proper waste disposal

## Development

### Running Locally
1. Clone this repository
2. Open `index.html` in a web browser
3. For development with live reloading, use a local server:
   ```bash
   npx serve -s
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Puter.ai for the AI image analysis API
- Tailwind CSS for the styling framework
- Font Awesome for icons

## Documentation
Detailed documentation can be found in the [docs/](docs/) directory:
- [Implementation Details](docs/implementation.md)
- [Roadmap](docs/roadmap.md)
- [API Documentation](docs/api.md)
- [Testing Documentation](docs/testing.md)
- [Contribution Guidelines](docs/contributing.md)
- [Style Guide](docs/style-guide.md)
