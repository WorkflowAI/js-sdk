import { expect, test } from '@jest/globals';
import { initWorkflowAIApi } from './api.js';
import * as createClients from './http-clients.js';
import {
  Middleware,
  customHeaders,
  throwError,
} from './middlewares/customHeaders.js';
import * as getEnv from './utils/getEnv.js';

beforeAll(() => {
  jest.spyOn(createClients, 'createJsonClient');
  jest.spyOn(createClients, 'createStreamClient');
  jest.spyOn(getEnv, 'getEnv');
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('WorkflowAIApi', () => {
  test('export api init function', () => {
    expect(initWorkflowAIApi).toBeInstanceOf(Function);
  });

  test('accept empty configuration', () => {
    expect(initWorkflowAIApi()).toBeTruthy();
  });

  test('create clients is called with the correct arguments, no middlware', () => {
    const config = { key: 'api_key', url: 'https://api.example.com' };
    initWorkflowAIApi(config);
    expect(createClients.createJsonClient).toHaveBeenCalledWith({
      ...config,
      use: [customHeaders, throwError],
    });
    expect(createClients.createStreamClient).toHaveBeenCalledWith({
      ...config,
      use: [customHeaders, throwError],
    });
  });

  test('create clients is called with defaults', () => {
    initWorkflowAIApi();
    expect(getEnv.getEnv).toHaveBeenCalledWith('WORKFLOWAI_API_KEY');
    expect(getEnv.getEnv).toHaveBeenCalledWith('WORKFLOWAI_API_URL');
    expect(createClients.createJsonClient).toHaveBeenCalledWith({
      key: undefined,
      url: 'https://run.workflowai.com',
      use: [customHeaders, throwError],
    });
    expect(createClients.createStreamClient).toHaveBeenCalledWith({
      key: undefined,
      url: 'https://run.workflowai.com',
      use: [customHeaders, throwError],
    });
  });

  test('create clients is called with values from env', () => {
    process.env.WORKFLOWAI_API_KEY = 'qui';
    process.env.WORKFLOWAI_API_URL = 'https://api.example.com';
    initWorkflowAIApi();
    expect(getEnv.getEnv).toHaveBeenCalledWith('WORKFLOWAI_API_KEY');
    expect(getEnv.getEnv).toHaveBeenCalledWith('WORKFLOWAI_API_URL');
    expect(createClients.createJsonClient).toHaveBeenCalledWith({
      key: 'qui',
      url: 'https://api.example.com',
      use: [customHeaders, throwError],
    });
    expect(createClients.createStreamClient).toHaveBeenCalledWith({
      key: 'qui',
      url: 'https://api.example.com',
      use: [customHeaders, throwError],
    });
  });

  test('create clients is called with the correct arguments, with middlware', () => {
    const m1: Middleware = { onRequest: jest.fn() };
    const m2: Middleware = { onRequest: jest.fn() };
    const config = {
      key: 'api_key',
      url: 'https://api.example.com',
      use: [m1, m2],
    };
    initWorkflowAIApi(config);
    expect(createClients.createJsonClient).toHaveBeenCalledWith({
      ...config,
      use: [customHeaders, m1, m2, throwError],
    });
    expect(createClients.createStreamClient).toHaveBeenCalledWith({
      ...config,
      use: [customHeaders, m1, m2, throwError],
    });
  });
});
