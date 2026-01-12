#!/usr/bin/env node
/**
 * Vision API Tester
 * Comprehensive testing tool for all vision API providers
 * 
 * Usage:
 *   node vision-api-tester.js list openrouter
 *   node vision-api-tester.js list gemini
 *   node vision-api-tester.js test openrouter molmo
 *   node vision-api-tester.js test gemini all
 *   node vision-api-tester.js speed gemini
 *   node vision-api-tester.js compare
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const DEFAULT_IMAGE = path.join(__dirname, 'tests', 'fixtures', 'plastic-bottle.jpg');

// ============================================================================
// OPENROUTER FUNCTIONS
// ============================================================================

async function listOpenRouterModels() {
    console.log('\n🔍 Fetching OpenRouter models...\n');

    const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${OPENROUTER_KEY}` }
    });

    const data = await response.json();
    const models = data.data || [];

    const freeVisionModels = models.filter(m => {
        const isFree = m.id.includes(':free') || m.pricing?.prompt === '0';
        const hasVision = m.architecture?.modality?.includes('image') ||
            m.id.includes('vision') || m.id.includes('vl');
        return isFree && hasVision;
    });

    console.log(`📊 Total models: ${models.length}`);
    console.log(`🎯 Free vision models: ${freeVisionModels.length}\n`);

    freeVisionModels.forEach((m, i) => {
        console.log(`${i + 1}. ${m.id}`);
        console.log(`   ${m.name}`);
        console.log(`   Context: ${m.context_length || 'N/A'}\n`);
    });

    return freeVisionModels;
}

async function testOpenRouterModel(modelId, imagePath = DEFAULT_IMAGE) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    console.log(`\n🧪 Testing: ${modelId}\n`);

    const startTime = Date.now();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: modelId,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'What is this item? Identify for waste sorting.' },
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                ]
            }]
        }),
        signal: AbortSignal.timeout(40000)
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
        const error = await response.text();
        console.log(`❌ Failed (${responseTime}ms): ${error.substring(0, 100)}`);
        return { success: false, modelId, responseTime, error: response.status };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No content';
    console.log(`✅ Success (${responseTime}ms)`);
    console.log(`📄 ${content.substring(0, 200)}...\n`);

    return { success: true, modelId, responseTime, content };
}

// ============================================================================
// GEMINI FUNCTIONS
// ============================================================================

async function listGeminiModels() {
    console.log('\n🔍 Fetching Gemini models...\n');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`);
    const data = await response.json();
    const models = data.models || [];

    const visionModels = models.filter(m => {
        const supportsGenerate = m.supportedGenerationMethods?.includes('generateContent');
        const name = m.name.toLowerCase();
        return supportsGenerate && (name.includes('flash') || name.includes('pro'));
    });

    console.log(`📊 Total models: ${models.length}`);
    console.log(`🎯 Vision models: ${visionModels.length}\n`);

    visionModels.forEach((m, i) => {
        console.log(`${i + 1}. ${m.name}`);
        console.log(`   ${m.displayName}`);
        console.log(`   Methods: ${m.supportedGenerationMethods.join(', ')}\n`);
    });

    return visionModels;
}

async function testGeminiModel(modelId, imagePath = DEFAULT_IMAGE) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    console.log(`\n🧪 Testing: ${modelId}\n`);

    const startTime = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelId}:generateContent?key=${GEMINI_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: 'What is this item? Identify for waste sorting.' },
                    { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
                ]
            }]
        }),
        signal: AbortSignal.timeout(30000)
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
        const error = await response.text();
        console.log(`❌ Failed (${responseTime}ms): ${error.substring(0, 100)}`);
        return { success: false, modelId, responseTime, error: response.status };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content';
    console.log(`✅ Success (${responseTime}ms = ${(responseTime / 1000).toFixed(2)}s)`);
    console.log(`📄 ${content.substring(0, 200)}...\n`);

    return { success: true, modelId, responseTime, content };
}

async function speedTestGemini() {
    const models = [
        'models/gemini-flash-lite-latest',
        'models/gemini-2.5-flash-lite',
        'models/gemini-flash-latest',
        'models/gemini-2.5-flash'
    ];

    console.log('\n⚡ GEMINI SPEED COMPARISON\n');

    const results = [];
    for (const model of models) {
        const result = await testGeminiModel(model);
        results.push(result);
        await new Promise(r => setTimeout(r, 2000));
    }

    const working = results.filter(r => r.success).sort((a, b) => a.responseTime - b.responseTime);

    console.log('\n📊 FASTEST TO SLOWEST:\n');
    working.forEach((r, i) => {
        const badge = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
        console.log(`${badge} ${r.responseTime}ms - ${r.modelId}`);
    });

    return working;
}

// ============================================================================
// MAIN CLI
// ============================================================================

async function main() {
    const [, , command, provider, ...args] = process.argv;

    if (!command) {
        console.log(`
Vision API Tester - Test and compare vision models

Usage:
  node vision-api-tester.js list <provider>
  node vision-api-tester.js test <provider> <model-id>
  node vision-api-tester.js speed <provider>

Commands:
  list openrouter       List all free OpenRouter vision models
  list gemini          List all Gemini vision models
  test openrouter <id> Test specific OpenRouter model
  test gemini <id>     Test specific Gemini model
  speed gemini         Speed comparison of Gemini models

Examples:
  node vision-api-tester.js list openrouter
  node vision-api-tester.js test openrouter allenai/molmo-2-8b:free
  node vision-api-tester.js speed gemini
    `);
        return;
    }

    try {
        if (command === 'list') {
            if (provider === 'openrouter') {
                if (!OPENROUTER_KEY) throw new Error('OPENROUTER_API_KEY not set in .env');
                await listOpenRouterModels();
            } else if (provider === 'gemini') {
                if (!GEMINI_KEY) throw new Error('GOOGLE_GEMINI_API_KEY not set in .env');
                await listGeminiModels();
            } else {
                console.error('Unknown provider. Use: openrouter or gemini');
            }
        } else if (command === 'test') {
            const modelId = args[0];
            if (!modelId) {
                console.error('Please provide a model ID');
                return;
            }

            if (provider === 'openrouter') {
                if (!OPENROUTER_KEY) throw new Error('OPENROUTER_API_KEY not set in .env');
                await testOpenRouterModel(modelId);
            } else if (provider === 'gemini') {
                if (!GEMINI_KEY) throw new Error('GOOGLE_GEMINI_API_KEY not set in .env');
                await testGeminiModel(modelId);
            }
        } else if (command === 'speed') {
            if (provider === 'gemini') {
                if (!GEMINI_KEY) throw new Error('GOOGLE_GEMINI_API_KEY not set in .env');
                await speedTestGemini();
            } else {
                console.error('Speed test only available for gemini');
            }
        } else {
            console.error('Unknown command. Use: list, test, or speed');
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    listOpenRouterModels,
    testOpenRouterModel,
    listGeminiModels,
    testGeminiModel,
    speedTestGemini
};
