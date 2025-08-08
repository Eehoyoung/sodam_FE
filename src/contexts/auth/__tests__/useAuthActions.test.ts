import { renderHook, act } from '@testing-library/react-native';
import { useAuthActions } from '../hooks/useAuthActions';

// Mock dependencies
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

jest.mock('../hooks/useStorage', () => ({
  useStorage: () => ({
    getItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

describe('useAuthActions', () => {
  let mockAuthService: any;
  let mockSafeLogger: any;
  let mockGetItem: jest.Mock;
  let mockRemoveItem: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthService = require('../../../features/auth/services/authService').default;
    mockSafeLogger = require('../../../utils/safeLogger').safeLogger;

    const { useStorage } = require('../hooks/useStorage');
    const storage = useStorage();
    mockGetItem = storage.getItem;
    mockRemoveItem = storage.removeItem;
  });

  test('should provide all required methods', () => {
    const { result } = renderHook(() => useAuthActions());

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.kakaoLogin).toBe('function');
    expect(typeof result.current.checkAuthStatus).toBe('function');
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  test('should handle successful login', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    mockAuthService.login.mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuthActions());

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password');
    });

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
    expect(loginResult).toEqual({ success: true, user: mockUser });
  });

  test('should handle login failure', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Login failed'));

    const { result } = renderHook(() => useAuthActions());

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'wrong-password');
    });

    expect(mockSafeLogger.error).toHaveBeenCalled();
    expect(loginResult).toEqual({ success: false });
  });

  test('should handle successful logout', async () => {
    mockAuthService.logout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuthActions());

    let logoutResult;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(logoutResult).toEqual({ success: true });
  });

  test('should handle logout failure gracefully', async () => {
    mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

    const { result } = renderHook(() => useAuthActions());

    let logoutResult;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    expect(mockSafeLogger.error).toHaveBeenCalled();
    expect(logoutResult).toEqual({ success: true }); // Should still succeed locally
  });

  test('should handle successful kakao login', async () => {
    const mockUser = { id: '1', email: 'test@kakao.com' };
    mockAuthService.kakaoLogin.mockResolvedValue({ token: 'kakao-token' });
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuthActions());

    let kakaoResult;
    await act(async () => {
      kakaoResult = await result.current.kakaoLogin('kakao-code');
    });

    expect(mockAuthService.kakaoLogin).toHaveBeenCalledWith('kakao-code');
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    expect(kakaoResult).toEqual({ success: true, user: mockUser });
  });

  test('should handle kakao login failure', async () => {
    mockAuthService.kakaoLogin.mockResolvedValue({ token: null });

    const { result } = renderHook(() => useAuthActions());

    let kakaoResult;
    await act(async () => {
      kakaoResult = await result.current.kakaoLogin('invalid-code');
    });

    expect(mockSafeLogger.error).toHaveBeenCalled();
    expect(kakaoResult).toEqual({ success: false });
  });

  test('should check auth status with valid token', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    mockGetItem.mockResolvedValue('valid-token');
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuthActions());

    let authResult;
    await act(async () => {
      authResult = await result.current.checkAuthStatus();
    });

    expect(mockGetItem).toHaveBeenCalledWith('userToken');
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    expect(authResult).toEqual({ success: true, user: mockUser });
  });

  test('should check auth status with no token', async () => {
    mockGetItem.mockResolvedValue(null);

    const { result } = renderHook(() => useAuthActions());

    let authResult;
    await act(async () => {
      authResult = await result.current.checkAuthStatus();
    });

    expect(mockGetItem).toHaveBeenCalledWith('userToken');
    expect(mockAuthService.getCurrentUser).not.toHaveBeenCalled();
    expect(authResult).toEqual({ success: true, user: null });
  });

  test('should handle auth check failure and remove invalid token', async () => {
    mockGetItem.mockResolvedValue('invalid-token');
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Invalid token'));
    mockRemoveItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuthActions());

    let authResult;
    await act(async () => {
      authResult = await result.current.checkAuthStatus();
    });

    expect(mockRemoveItem).toHaveBeenCalledWith('userToken');
    expect(mockSafeLogger.error).toHaveBeenCalled();
    expect(authResult).toEqual({ success: true, user: null });
  });

  test('should provide consistent interface', () => {
    const { result } = renderHook(() => useAuthActions());

    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('kakaoLogin');
    expect(result.current).toHaveProperty('checkAuthStatus');
    expect(result.current).toHaveProperty('isLoading');
  });
});
