import { renderHook, act } from '@testing-library/react-native';
import { useFirstLaunch } from '../hooks/useFirstLaunch';

// Mock useStorage hook
jest.mock('../hooks/useStorage', () => ({
  useStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
  }),
}));

describe('useFirstLaunch', () => {
  let mockGetItem: jest.Mock;
  let mockSetItem: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get the mocked functions
    const { useStorage } = require('../hooks/useStorage');
    const storage = useStorage();
    mockGetItem = storage.getItem;
    mockSetItem = storage.setItem;
  });

  test('should initialize with default state', () => {
    const { result } = renderHook(() => useFirstLaunch());

    expect(result.current.isFirstLaunch).toBe(true);
    expect(result.current.loading).toBe(true); // Now starts with loading true
    expect(typeof result.current.checkFirstLaunch).toBe('function');
    expect(typeof result.current.setFirstLaunchComplete).toBe('function');
  });

  test('should check first launch when no previous launch detected', async () => {
    mockGetItem.mockResolvedValue(null);

    const { result } = renderHook(() => useFirstLaunch());

    await act(async () => {
      await result.current.checkFirstLaunch();
    });

    expect(mockGetItem).toHaveBeenCalledWith('hasLaunched');
    expect(result.current.isFirstLaunch).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  test('should check first launch when previous launch detected', async () => {
    mockGetItem.mockResolvedValue('true');

    const { result } = renderHook(() => useFirstLaunch());

    await act(async () => {
      await result.current.checkFirstLaunch();
    });

    expect(mockGetItem).toHaveBeenCalledWith('hasLaunched');
    expect(result.current.isFirstLaunch).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  test('should handle checkFirstLaunch error gracefully', async () => {
    mockGetItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useFirstLaunch());

    await act(async () => {
      await result.current.checkFirstLaunch();
    });

    expect(result.current.isFirstLaunch).toBe(true); // Should default to true on error
    expect(result.current.loading).toBe(false);
  });

  test('should set first launch complete successfully', async () => {
    mockSetItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirstLaunch());

    await act(async () => {
      await result.current.setFirstLaunchComplete();
    });

    expect(mockSetItem).toHaveBeenCalledWith('hasLaunched', 'true');
    expect(result.current.isFirstLaunch).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  test('should handle setFirstLaunchComplete error gracefully', async () => {
    mockSetItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useFirstLaunch());

    await act(async () => {
      await result.current.setFirstLaunchComplete();
    });

    expect(mockSetItem).toHaveBeenCalledWith('hasLaunched', 'true');
    expect(result.current.loading).toBe(false);
    // isFirstLaunch state should remain unchanged on error
  });

  test('should show loading state during operations', async () => {
    let resolveGetItem: (value: any) => void;
    const getItemPromise = new Promise(resolve => {
      resolveGetItem = resolve;
    });
    mockGetItem.mockReturnValue(getItemPromise);

    const { result } = renderHook(() => useFirstLaunch());

    // Start the async operation
    act(() => {
      result.current.checkFirstLaunch();
    });

    // Should be loading
    expect(result.current.loading).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolveGetItem(null);
      await getItemPromise;
    });

    // Should no longer be loading
    expect(result.current.loading).toBe(false);
  });

  test('should provide consistent interface', () => {
    const { result } = renderHook(() => useFirstLaunch());

    expect(result.current).toHaveProperty('isFirstLaunch');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('checkFirstLaunch');
    expect(result.current).toHaveProperty('setFirstLaunchComplete');
  });

  test('should auto-initialize when hook is first used', async () => {
    mockGetItem.mockResolvedValue('true'); // Previous launch detected

    const { result } = renderHook(() => useFirstLaunch());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.isFirstLaunch).toBe(true);

    // Wait for auto-initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(mockGetItem).toHaveBeenCalledWith('hasLaunched');
    expect(result.current.isFirstLaunch).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  test('should handle auto-initialization error gracefully', async () => {
    mockGetItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useFirstLaunch());

    // Wait for auto-initialization to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.isFirstLaunch).toBe(true); // Should default to true on error
    expect(result.current.loading).toBe(false);
  });

  test('should prevent infinite loading with timeout', async () => {
    jest.useFakeTimers();

    // Mock getItem to never resolve
    mockGetItem.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useFirstLaunch());

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Fast-forward time to trigger timeout
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should have stopped loading due to timeout
    expect(result.current.loading).toBe(false);
    expect(result.current.isFirstLaunch).toBe(true); // Default to first launch on timeout

    jest.useRealTimers();
  });

  test('should not re-initialize if already initialized', async () => {
    mockGetItem.mockResolvedValue(null);

    const { result, rerender } = renderHook(() => useFirstLaunch());

    // Wait for first initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(mockGetItem).toHaveBeenCalledTimes(1);

    // Rerender the hook
    rerender();

    // Wait a bit more
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should not call getItem again
    expect(mockGetItem).toHaveBeenCalledTimes(1);
  });
});
