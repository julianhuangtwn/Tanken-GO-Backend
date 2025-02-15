const request = require('supertest');
const app = require('../../src/app');
const OpenAI = require('openai');

const logger = require('../../src/logger');

jest.mock('openai');

describe('POST /v1/ai', () => {
    let mockCreate;

    beforeEach(() => {
        mockCreate = jest.fn().mockResolvedValue({
            choices: [{ message: { content: "Mocked AI itinerary" } }],
        });

        OpenAI.mockImplementation(() => ({
            chat: { completions: { create: mockCreate } },
        }));
    });

    test('Valid user requests will return a proper itinerary', async () => {
        
    })
});


