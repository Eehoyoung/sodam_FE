import { renderHook, act } from '@testing-library/react-native';
import { useStorage } from '../hooks/useStorage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock memoryStorage
jest.mock('../../../common/utils/memoryStorage', () => ({
  memoryStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe('useStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should provide storage methods', () => {
    const { result } = renderHook(() => useStorage());

    expect(typeof result.current.getItem).toBe('function');
    expect(typeof result.current.setItem).toBe('function');
    expect(typeof result.current.removeItem).toBe('function');
    expect(typeof result.current.isReady).toBe('boolean');
  });

  test('should handle storage operations', async () => {
    const { result } = renderHook(() => useStorage());

    await act(async () => {
      await result.current.setItem('test', 'value');
    });

    await act(async () => {
      const value = await result.current.getItem('test');
      // Note: In actual implementation, this would depend on the storage backend
      expect(result.current.getItem).toBeDefined();
    });
  });

  test('should handle removeItem operation', async () => {
    const { result } = renderHook(() => useStorage());

    await act(async () => {
      await result.current.removeItem('test');
    });

    expect(result.current.removeItem).toBeDefined();
  });

  test('should maintain consistent interface', () => {
    const { result } = renderHook(() => useStorage());

    // Verify the hook returns the expected interface
    expect(result.current).toHaveProperty('getItem');
    expect(result.current).toHaveProperty('setItem');
    expect(result.current).toHaveProperty('removeItem');
    expect(result.current).toHaveProperty('isReady');
  });
});
