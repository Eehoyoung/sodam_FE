import { renderHook, act } from '@testing-library/react-native';
import { useAuthState } from '../hooks/useAuthState';

// Mock User type
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
};

describe('useAuthState', () => {
  test('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthState());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(true);
  });

  test('should provide all required methods', () => {
    const { result } = renderHook(() => useAuthState());

    expect(typeof result.current.setAuthState).toBe('function');
    expect(typeof result.current.setUser).toBe('function');
    expect(typeof result.current.setLoading).toBe('function');
    expect(typeof result.current.setAuthenticated).toBe('function');
    expect(typeof result.current.resetAuth).toBe('function');
  });

  test('should update loading state', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.loading).toBe(false);
  });

  test('should set user and update authentication state', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  test('should handle null user correctly', () => {
    const { result } = renderHook(() => useAuthState());

    // First set a user
    act(() => {
      result.current.setUser(mockUser);
    });

    // Then set to null
    act(() => {
      result.current.setUser(null);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  test('should update authentication state directly', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setAuthenticated(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  test('should reset authentication state', () => {
    const { result } = renderHook(() => useAuthState());

    // First set authenticated state
    act(() => {
      result.current.setUser(mockUser);
    });

    // Then reset
    act(() => {
      result.current.resetAuth();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  test('should update partial state with setAuthState', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setAuthState({
        loading: false,
        isAuthenticated: true
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBe(null); // Should remain unchanged
  });
});
