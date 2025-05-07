import axios from 'axios';
import { throttledGetDataFromApi } from './index';

jest.mock('axios');

describe('throttledGetDataFromApi', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.create.mockReturnThis();
    mockedAxios.get.mockResolvedValue({ data: 'test data' });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('should create instance with provided base url', async () => {
    await throttledGetDataFromApi('/test');
    jest.runAllTimers();
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'https://jsonplaceholder.typicode.com',
    });
  });

  test('should perform request to correct provided url', async () => {
    const testPath = '/test';
    await throttledGetDataFromApi(testPath);
    jest.runAllTimers();
    expect(mockedAxios.get).toHaveBeenCalledWith(testPath);
  });

  test('should return response data', async () => {
    const result = await throttledGetDataFromApi('/test');
    jest.runAllTimers();
    expect(result).toBe('test data');
  });
});
