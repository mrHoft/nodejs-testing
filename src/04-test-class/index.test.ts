import { getBankAccount, InsufficientFundsError, TransferFailedError, SynchronizationFailedError } from './index';

describe('BankAccount', () => {
  const initialBalance = 100;
  let account: ReturnType<typeof getBankAccount>;
  let anotherAccount: ReturnType<typeof getBankAccount>;

  beforeEach(() => {
    account = getBankAccount(initialBalance);
    anotherAccount = getBankAccount(0);
  });

  test('should create account with initial balance', () => {
    expect(account.getBalance()).toBe(initialBalance);
  });

  test('should throw InsufficientFundsError error when withdrawing more than balance', () => {
    expect(() => account.withdraw(initialBalance + 1)).toThrow(InsufficientFundsError);
  });

  test('should throw error when transferring more than balance', () => {
    expect(() => account.transfer(initialBalance + 1, anotherAccount)).toThrow(InsufficientFundsError);
  });

  test('should throw error when transferring to the same account', () => {
    expect(() => account.transfer(10, account)).toThrow(TransferFailedError);
  });

  test('should deposit money', () => {
    account.deposit(50);
    expect(account.getBalance()).toBe(initialBalance + 50);
  });

  test('should withdraw money', () => {
    account.withdraw(50);
    expect(account.getBalance()).toBe(initialBalance - 50);
  });

  test('should transfer money', () => {
    account.transfer(50, anotherAccount);
    expect(account.getBalance()).toBe(initialBalance - 50);
    expect(anotherAccount.getBalance()).toBe(50);
  });

  test('fetchBalance should return number in case if request did not failed', async () => {
    const results = await Promise.all(
      Array(100)
        .fill(null)
        .map(() => account.fetchBalance()),
    );
    const hasNumberResult = results.some((result) => typeof result === 'number');
    expect(hasNumberResult).toBe(true);
  });

  test('should set new balance if fetchBalance returned number', async () => {
    for (let i = 0; i < 100; i++) {
      try {
        await account.synchronizeBalance();
        expect(account.getBalance()).toBeGreaterThanOrEqual(0);
        expect(account.getBalance()).toBeLessThanOrEqual(100);
        return;
      } catch (e) {
        // Continue trying
      }
    }
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    for (let i = 0; i < 100; i++) {
      try {
        await account.synchronizeBalance();
      } catch (e) {
        expect(e).toBeInstanceOf(SynchronizationFailedError);
        return;
      }
    }
  });
});
