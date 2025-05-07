import { readFileAsynchronously, doStuffByTimeout, doStuffByInterval } from './index';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('path');

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
const mockJoin = join as jest.MockedFunction<typeof join>;

describe('doStuffByTimeout', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should set timeout with provided callback and timeout', () => {
    const callback = jest.fn();
    const timeout = 1000;

    jest.spyOn(global, 'setTimeout');
    doStuffByTimeout(callback, timeout);

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(callback, timeout);
  });

  test('should call callback only after timeout', () => {
    const callback = jest.fn();
    const timeout = 1000;

    doStuffByTimeout(callback, timeout);

    expect(callback).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('doStuffByInterval', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should set interval with provided callback and timeout', () => {
    const callback = jest.fn();
    const interval = 1000;

    jest.spyOn(global, 'setInterval');
    doStuffByInterval(callback, interval);

    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenLastCalledWith(callback, interval);
  });

  test('should call callback multiple times after multiple intervals', () => {
    const callback = jest.fn();
    const interval = 1000;

    doStuffByInterval(callback, interval);

    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(interval);
    expect(callback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(interval * 5);
    expect(callback).toHaveBeenCalledTimes(6);
  });
});

describe('readFileAsynchronously', () => {
  const testPath = 'test.txt';
  const testContent = 'file content';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call join with pathToFile', async () => {
    mockJoin.mockReturnValue(`/mock/path/${testPath}`);

    await readFileAsynchronously(testPath);

    expect(mockJoin).toHaveBeenCalledWith(expect.any(String), testPath);
  });

  test('should return null if file does not exist', async () => {
    mockExistsSync.mockReturnValue(false);

    const result = await readFileAsynchronously(testPath);

    expect(result).toBeNull();
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  test('should return file content if file exists', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFile.mockResolvedValue(Buffer.from(testContent));

    const result = await readFileAsynchronously(testPath);

    expect(result).toBe(testContent);
    expect(mockReadFile).toHaveBeenCalled();
  });
});
