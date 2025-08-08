import { formatCurrency, formatDate, formatTime } from '../formatters';

describe('formatters', () => {
    describe('formatCurrency', () => {
        test('formats positive numbers correctly', () => {
            expect(formatCurrency(10000)).toBe('₩10,000');
            expect(formatCurrency(1500)).toBe('₩1,500');
            expect(formatCurrency(0)).toBe('₩0');
        });

        test('formats large numbers correctly', () => {
            expect(formatCurrency(1000000)).toBe('₩1,000,000');
            expect(formatCurrency(50000000)).toBe('₩50,000,000');
        });

        test('formats decimal numbers correctly (rounds to whole numbers)', () => {
            expect(formatCurrency(1500.99)).toBe('₩1,501');
            expect(formatCurrency(999.49)).toBe('₩999');
        });

        test('handles negative numbers', () => {
            expect(formatCurrency(-1000)).toBe('-₩1,000');
            expect(formatCurrency(-50000)).toBe('-₩50,000');
        });
    });

    describe('formatDate', () => {
        test('formats ISO date strings correctly', () => {
            expect(formatDate('2025-01-15')).toBe('2025년 1월 15일');
            expect(formatDate('2025-12-31')).toBe('2025년 12월 31일');
        });

        test('formats full ISO datetime strings correctly', () => {
            expect(formatDate('2025-08-07T10:30:00Z')).toBe('2025년 8월 7일');
            expect(formatDate('2025-03-22T15:45:30.123Z')).toBe('2025년 3월 22일');
        });

        test('handles different months correctly', () => {
            expect(formatDate('2025-02-28')).toBe('2025년 2월 28일');
            expect(formatDate('2025-06-15')).toBe('2025년 6월 15일');
            expect(formatDate('2025-11-03')).toBe('2025년 11월 3일');
        });
    });

    describe('formatTime', () => {
        test('formats morning times correctly', () => {
            expect(formatTime('09:30')).toBe('오전 9:30');
            expect(formatTime('11:45')).toBe('오전 11:45');
            expect(formatTime('00:15')).toBe('오전 12:15');
        });

        test('formats afternoon times correctly', () => {
            expect(formatTime('13:30')).toBe('오후 1:30');
            expect(formatTime('18:45')).toBe('오후 6:45');
            expect(formatTime('23:59')).toBe('오후 11:59');
        });

        test('formats noon and midnight correctly', () => {
            expect(formatTime('12:00')).toBe('오후 12:00');
            expect(formatTime('00:00')).toBe('오전 12:00');
        });

        test('handles null and empty values', () => {
            expect(formatTime(null)).toBe('-');
            expect(formatTime('')).toBe('-');
        });

        test('handles edge cases', () => {
            expect(formatTime('01:00')).toBe('오전 1:00');
            expect(formatTime('12:30')).toBe('오후 12:30');
            expect(formatTime('00:30')).toBe('오전 12:30');
        });

        test('preserves minutes formatting', () => {
            expect(formatTime('09:05')).toBe('오전 9:05');
            expect(formatTime('14:09')).toBe('오후 2:09');
        });
    });
});
