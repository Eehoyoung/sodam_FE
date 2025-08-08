import {useState, useEffect} from 'react';

// Define attendance type
export type Attendance = {
    id: string;
    date: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    workingHours: number | null;
    // Add other attendance properties as needed
};

export const useAttendance = () => {
    const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setIsLoading(true);
                // TODO: API 연결 필요 - 출퇴근 정보를 가져오는 API 호출로 대체해야 함
                // In a real app, this would be an API call
                // For now, we'll use mock data
                const today = new Date().toISOString().split('T')[0];

                // Create mock attendance data
                const mockAttendance: Attendance = {
                    id: '1',
                    date: today,
                    checkInTime: '09:00',
                    checkOutTime: null, // Not checked out yet
                    workingHours: null, // Will be calculated after checkout
                };

                // Simulate API delay
                setTimeout(() => {
                    setTodayAttendance(mockAttendance);
                    setIsLoading(false);
                }, 500);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setIsLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    return {todayAttendance, isLoading, error};
};
