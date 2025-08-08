/**
 * 출퇴근 관리 관련 서비스
 * 출퇴근 기록 조회, 출근, 퇴근, 수정 및 통계 기능을 제공합니다.
 */

import api from '../../../common/utils/api';
import {
    AttendanceRecord,
    AttendanceStatus,
    AttendanceStatistics,
    AttendanceFilter,
    CheckInRequest,
    CheckOutRequest,
    UpdateAttendanceRequest
} from '../types';
import {verifyCheckInByLocation, verifyCheckOutByLocation, LocationVerifyResponse} from './locationAttendanceService';
import {verifyCheckInByQR, verifyCheckOutByQR, QRVerifyResponse} from './qrAttendanceService';

// 출퇴근 관리 서비스 객체
const attendanceService = {
    /**
     * 출퇴근 기록 목록 조회
     * @param filter 필터 조건
     * @returns 출퇴근 기록 목록
     */
    getAttendanceRecords: async (filter: AttendanceFilter): Promise<AttendanceRecord[]> => {
        try {
            const response = await api.get<AttendanceRecord[]>('/attendance', filter);
            return response.data;
        } catch (error) {
            console.error('출퇴근 기록을 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 출퇴근 기록 조회
     * @param attendanceId 출퇴근 기록 ID
     * @returns 출퇴근 기록
     */
    getAttendanceById: async (attendanceId: string): Promise<AttendanceRecord> => {
        try {
            const response = await api.get<AttendanceRecord>(`/attendance/${attendanceId}`);
            return response.data;
        } catch (error) {
            console.error('출퇴근 기록을 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 출근 처리
     * @param checkInData 출근 데이터
     * @returns 생성된 출퇴근 기록
     */
    checkIn: async (checkInData: CheckInRequest): Promise<AttendanceRecord> => {
        try {
            const response = await api.post<AttendanceRecord>('/attendance/check-in', checkInData);
            return response.data;
        } catch (error) {
            console.error('출근 처리 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 퇴근 처리
     * @param attendanceId 출퇴근 기록 ID
     * @param checkOutData 퇴근 데이터
     * @returns 업데이트된 출퇴근 기록
     */
    checkOut: async (attendanceId: string, checkOutData: CheckOutRequest): Promise<AttendanceRecord> => {
        try {
            const response = await api.post<AttendanceRecord>(`/attendance/${attendanceId}/check-out`, checkOutData);
            return response.data;
        } catch (error) {
            console.error('퇴근 처리 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 출퇴근 기록 수정
     * @param attendanceId 출퇴근 기록 ID
     * @param updateData 수정 데이터
     * @returns 업데이트된 출퇴근 기록
     */
    updateAttendance: async (attendanceId: string, updateData: UpdateAttendanceRequest): Promise<AttendanceRecord> => {
        try {
            const response = await api.put<AttendanceRecord>(`/attendance/${attendanceId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('출퇴근 기록 수정 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 출퇴근 기록 삭제
     * @param attendanceId 출퇴근 기록 ID
     */
    deleteAttendance: async (attendanceId: string): Promise<void> => {
        try {
            await api.delete(`/attendance/${attendanceId}`);
        } catch (error) {
            console.error('출퇴근 기록 삭제 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 현재 근무 상태 조회
     * @param workplaceId 근무지 ID
     * @returns 현재 출퇴근 기록 (없으면 null)
     */
    getCurrentAttendance: async (workplaceId: string): Promise<AttendanceRecord | null> => {
        try {
            const response = await api.get<AttendanceRecord | null>('/attendance/current', {workplaceId});
            return response.data;
        } catch (error) {
            console.error('현재 근무 상태를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 출퇴근 통계 조회
     * @param filter 필터 조건
     * @returns 출퇴근 통계
     */
    getAttendanceStatistics: async (filter: AttendanceFilter): Promise<AttendanceStatistics> => {
        try {
            const response = await api.get<AttendanceStatistics>('/attendance/statistics', filter);
            return response.data;
        } catch (error) {
            console.error('출퇴근 통계를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 직원별 출퇴근 통계 조회
     * @param employeeId 직원 ID
     * @param startDate 시작일
     * @param endDate 종료일
     * @returns 직원별 출퇴근 통계
     */
    getEmployeeAttendanceStatistics: async (
        employeeId: string,
        startDate: string,
        endDate: string
    ): Promise<AttendanceStatistics> => {
        try {
            const response = await api.get<AttendanceStatistics>(`/attendance/statistics/employee/${employeeId}`, {
                startDate,
                endDate
            });
            return response.data;
        } catch (error) {
            console.error('직원별 출퇴근 통계를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 근무지별 출퇴근 통계 조회
     * @param workplaceId 근무지 ID
     * @param startDate 시작일
     * @param endDate 종료일
     * @returns 근무지별 출퇴근 통계
     */
    getWorkplaceAttendanceStatistics: async (
        workplaceId: string,
        startDate: string,
        endDate: string
    ): Promise<AttendanceStatistics> => {
        try {
            const response = await api.get<AttendanceStatistics>(`/attendance/statistics/workplace/${workplaceId}`, {
                startDate,
                endDate
            });
            return response.data;
        } catch (error) {
            console.error('근무지별 출퇴근 통계를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 일괄 출퇴근 상태 변경
     * @param attendanceIds 출퇴근 기록 ID 배열
     * @param status 변경할 상태
     * @returns 업데이트된 출퇴근 기록 배열
     */
    batchUpdateStatus: async (
        attendanceIds: string[],
        status: AttendanceStatus
    ): Promise<AttendanceRecord[]> => {
        try {
            const response = await api.put<AttendanceRecord[]>('/attendance/batch-status', {
                attendanceIds,
                status
            });
            return response.data;
        } catch (error) {
            console.error('일괄 출퇴근 상태 변경 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 위치 기반 출퇴근 인증
     * @param employeeId 직원 ID
     * @param workplaceId 근무지 ID
     * @param latitude 위도
     * @param longitude 경도
     * @returns 인증 결과 (성공 여부 및 거리 정보)
     */
    verifyLocationAttendance: async (
        employeeId: string,
        workplaceId: string,
        latitude: number,
        longitude: number
    ): Promise<{ success: boolean; distance?: number; message?: string }> => {
        try {
            const response = await api.post<{ success: boolean; distance?: number; message?: string }>(
                '/attendance/location-verify',
                {
                    employeeId,
                    workplaceId,
                    latitude,
                    longitude
                }
            );
            return response.data;
        } catch (error) {
            console.error('위치 기반 출퇴근 인증 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * QR 코드 기반 출퇴근 인증
     * @param employeeId 직원 ID
     * @param workplaceId 근무지 ID
     * @param qrCode QR 코드 문자열
     * @returns 인증 결과 (성공 여부)
     */
    verifyQrCodeAttendance: async (
        employeeId: string,
        workplaceId: string,
        qrCode: string
    ): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await api.post<{ success: boolean; message?: string }>(
                '/attendance/qr-verify',
                {
                    employeeId,
                    workplaceId,
                    qrCode
                }
            );
            return response.data;
        } catch (error) {
            console.error('QR 코드 기반 출퇴근 인증 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 매장별 QR 코드 생성
     * @param workplaceId 근무지 ID
     * @returns QR 코드 이미지 URL 또는 인코딩된 문자열
     */
    getWorkplaceQrCode: async (workplaceId: string): Promise<{ qrCode: string }> => {
        try {
            const response = await api.get<{ qrCode: string }>(`/stores/${workplaceId}/qr-code`);
            return response.data;
        } catch (error) {
            console.error('매장별 QR 코드 생성 중 오류가 발생했습니다:', error);
            throw error;
        }
    },
};

export default attendanceService;
