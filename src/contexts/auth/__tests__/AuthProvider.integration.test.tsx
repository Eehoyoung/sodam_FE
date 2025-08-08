import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../providers/AuthProvider';

// Mock all dependencies
jest.mock('../../../features/auth/services/authService', () => ({
  default: {
    login: jest.fn(),
    logout: jest.fn(),
    kakaoLogin: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('../../../utils/safeLogger', () => ({
  safeLogger: {
    error: jest.fn(),
  },
}));

jest.mock('../../../common/utils/memoryStorage', () => ({
  memoryStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe('AuthProvider Integration Tests', () => {
  let mockAuthService: any;
  let mockMemoryStorage: any;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockAuthService = require('../../../features/auth/services/authService').default;
    mockMemoryStorage = require('../../../common/utils/memoryStorage').memoryStorage;

    // Default mock implementations
    mockMemoryStorage.getItem.mockResolvedValue(null);
    mockMemoryStorage.setItem.mockResolvedValue(undefined);
    mockMemoryStorage.removeItem.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should initialize with default state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isFirstLaunch).toBe(true);
  });

  test('should provide all required methods', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.kakaoLogin).toBe('function');
    expect(typeof result.current.setFirstLaunchComplete).toBe('function');
  });

  test('should handle initialization with no stored data', async () => {
    mockMemoryStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Fast-forward timers to trigger initialization
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Wait for async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isFirstLaunch).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('should handle successful login flow', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    mockAuthService.login.mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  test('should handle login failure', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login('test@example.com', 'wrong-password');
      })
    ).rejects.toThrow('Login failed');

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  test('should handle logout flow', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    mockAuthService.login.mockResolvedValue({ user: mockUser });
    mockAuthService.logout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // First login
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  test('should handle kakao login flow', async () => {
    const mockUser = { id: '1', email: 'test@kakao.com', name: 'Kakao User' };
    mockAuthService.kakaoLogin.mockResolvedValue({ token: 'kakao-token' });
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.kakaoLogin('kakao-auth-code');
    });

    expect(mockAuthService.kakaoLogin).toHaveBeenCalledWith('kakao-auth-code');
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  test('should handle first launch completion', async () => {
    mockMemoryStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isFirstLaunch).toBe(true);

    await act(async () => {
      await result.current.setFirstLaunchComplete();
    });

    expect(mockMemoryStorage.setItem).toHaveBeenCalledWith('hasLaunched', 'true');
    expect(result.current.isFirstLaunch).toBe(false);
  });

  test('should handle initialization timeout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);

    // Fast-forward to max timeout
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
  });

  test('should handle no token found scenario without infinite loading', async () => {
    // Mock no token scenario
    mockMemoryStorage.getItem.mockResolvedValue(null);
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('No token'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);

    // Fast-forward timers to trigger initialization
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Wait for async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should complete loading and remain unauthenticated
    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isFirstLaunch).toBe(true);
  });

  test('should maintain API compatibility with original AuthContext', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Verify all expected properties exist
    const expectedProperties = [
      'isAuthenticated',
      'user',
      'loading',
      'isFirstLaunch',
      'login',
      'logout',
      'kakaoLogin',
      'setFirstLaunchComplete'
    ];

    expectedProperties.forEach(prop => {
      expect(result.current).toHaveProperty(prop);
    });

    // Verify types
    expect(typeof result.current.isAuthenticated).toBe('boolean');
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.isFirstLaunch).toBe('boolean');
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.kakaoLogin).toBe('function');
    expect(typeof result.current.setFirstLaunchComplete).toBe('function');
  });

  test('should handle useAuth outside provider gracefully', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.isFirstLaunch).toBe(true);

    // Methods should throw errors
    expect(result.current.login).toThrow;
    expect(result.current.logout).toThrow;
    expect(result.current.kakaoLogin).toThrow;
    expect(result.current.setFirstLaunchComplete).toThrow;
  });
});
