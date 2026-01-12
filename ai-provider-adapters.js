/**
 * Provider Adapters for Multi-Provider Vision API
 * Converts requests/responses between different API formats
 */

class BaseAdapter {
    formatRequest(prompt, imageData) {
        if (!prompt || !imageData) {
            throw new Error('Prompt and imageData are required');
        }
    }

    parseResponse(response) {
        if (!response) {
            throw new Error('Response is required');
        }
    }
}

/**
 * Adapter for Pollinations.AI API (Gemini/Bidara models)
 * Uses OpenAI-compatible format
 */
class PollinationsAdapter extends BaseAdapter {
    constructor(model) {
        super();
        this.model = model;
    }

    formatRequest(prompt, imageData) {
        super.formatRequest(prompt, imageData);

        // Clean base64 if it has data URL prefix
        let base64Image = imageData;
        if (imageData.startsWith('data:')) {
            const base64Match = imageData.match(/,(.+)$/);
            base64Image = base64Match ? base64Match[1] : imageData;
        }

        return {
            model: this.model,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000
        };
    }

    parseResponse(response) {
        super.parseResponse(response);

        if (!response.choices || !response.choices[0] || !response.choices[0].message) {
            throw new Error('Invalid Pollinations API response structure');
        }

        let content = response.choices[0].message.content;

        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            content = jsonMatch[1];
        }

        return {
            content: content
        };
    }
}

/**
 * Adapter for Hugging Face Inference API
 * Uses Moondream2 small vision model
 */
class HuggingFaceAdapter extends BaseAdapter {
    constructor(model) {
        super();
        this.model = model;
    }

    formatRequest(prompt, imageData) {
        super.formatRequest(prompt, imageData);

        // Clean base64 if it has data URL prefix
        let base64Image = imageData;
        if (imageData.startsWith('data:')) {
            const base64Match = imageData.match(/,(.+)$/);
            base64Image = base64Match ? base64Match[1] : imageData;
        }

        // Hugging Face format
        return {
            inputs: {
                text: prompt,
                image: base64Image
            },
            parameters: {
                max_new_tokens: 500
            }
        };
    }

    parseResponse(response) {
        super.parseResponse(response);

        // Check for error response
        if (response.error) {
            throw new Error(`Hugging Face API error: ${response.error}`);
        }

        // Hugging Face returns array with generated_text
        if (Array.isArray(response) && response[0] && response[0].generated_text) {
            return {
                content: response[0].generated_text
            };
        }

        throw new Error('Invalid Hugging Face API response structure');
    }
}

/**
 * Adapter for Jina Reader API
 * Simple captioning service
 */
class JinaAdapter extends BaseAdapter {
    formatRequest(prompt, imageData) {
        super.formatRequest(prompt, imageData);

        // Clean base64 if it has data URL prefix
        let base64Image = imageData;
        if (imageData.startsWith('data:')) {
            const base64Match = imageData.match(/,(.+)$/);
            base64Image = base64Match ? base64Match[1] : imageData;
        }

        return {
            image: base64Image,
            prompt: prompt
        };
    }

    parseResponse(response) {
        super.parseResponse(response);

        if (!response.caption) {
            throw new Error('Invalid Jina API response structure');
        }

        // Jina only provides captions, return as-is
        return {
            content: response.caption
        };
    }
}

/**
 * Adapter for OpenRouter API
 * Supports multiple vision models with unified interface
 */
class OpenRouterAdapter extends BaseAdapter {
    constructor(model) {
        super();
        this.model = model;
    }

    formatRequest(prompt, imageData) {
        super.formatRequest(prompt, imageData);

        // Clean base64 if it has data URL prefix
        let base64Image = imageData;
        if (imageData.startsWith('data:')) {
            const base64Match = imageData.match(/,(.+)$/);
            base64Image = base64Match ? base64Match[1] : imageData;
        }

        // OpenAI-compatible format (OpenRouter uses this)
        return {
            model: this.model,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ]
        };
    }

    parseResponse(response) {
        super.parseResponse(response);

        if (!response.choices || !response.choices[0] || !response.choices[0].message) {
            throw new Error('Invalid OpenRouter API response structure');
        }

        let content = response.choices[0].message.content;

        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            content = jsonMatch[1];
        }

        return {
          ]
        }
      ]
    };
}

parseResponse(response) {
    super.parseResponse(response);

    if (!response.candidates || !response.candidates[0]) {
        throw new Error('Invalid Gemini API response structure');
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
        throw new Error('Invalid Gemini content structure');
    }

    const content = candidate.content.parts[0].text;

    return {
        content: content
    };
}
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PollinationsAdapter,
        HuggingFaceAdapter,
        JinaAdapter,
        OpenRouterAdapter,
        GeminiAdapter
    };
}
