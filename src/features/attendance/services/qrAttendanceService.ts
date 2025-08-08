import {api} from '../../../common/utils/api';

export interface QRVerifyRequest {
    employeeId: number;
    storeId: number;
    qrCode: string;
}

export interface QRVerifyResponse {
    success: boolean;
    message?: string;
    timestamp?: string;
}

/**
 * QR 코드 기반 출근 인증 API
 * @param request QR 코드 인증 요청 데이터
 * @returns 인증 결과
 */
export const verifyCheckInByQR = async (
    request: QRVerifyRequest
): Promise<QRVerifyResponse> => {
    try {
        const response = await api.post<QRVerifyResponse>(
            '/api/attendance/qr-verify',
            request
        );
        return response.data;
    } catch (error) {
        console.error('QR 코드 기반 출근 인증 실패:', error);
        return {
            success: false,
            message: 'QR 코드 기반 출근 인증에 실패했습니다. 다시 시도해주세요.'
        };
    }
};

/**
 * QR 코드 기반 퇴근 인증 API
 * @param request QR 코드 인증 요청 데이터
 * @returns 인증 결과
 */
export const verifyCheckOutByQR = async (
    request: QRVerifyRequest
): Promise<QRVerifyResponse> => {
    try {
        // 출근과 동일한 엔드포인트를 사용하지만, 퇴근 플래그 추가
        const response = await api.post<QRVerifyResponse>(
            '/api/attendance/qr-verify',
            {
                ...request,
                isCheckOut: true
            }
        );
        return response.data;
    } catch (error) {
        console.error('QR 코드 기반 퇴근 인증 실패:', error);
        return {
            success: false,
            message: 'QR 코드 기반 퇴근 인증에 실패했습니다. 다시 시도해주세요.'
        };
    }
};

/**
 * 매장별 QR 코드 생성 API
 * @param storeId 매장 ID
 * @param size QR 코드 크기 (small, medium, large)
 * @returns QR 코드 URL 또는 인코딩된 문자열
 */
export const generateStoreQRCode = async (
    storeId: number,
    size: 'small' | 'medium' | 'large' = 'medium'
): Promise<string> => {
    try {
        const response = await api.get<{ qrCode: string }>(
            `/api/stores/${storeId}/qr-code`,
            {
                params: {size}
            }
        );
        return response.data.qrCode;
    } catch (error) {
        console.error('QR 코드 생성 실패:', error);
        throw new Error('QR 코드 생성에 실패했습니다. 다시 시도해주세요.');
    }
};

/**
 * QR 코드 데이터 파싱
 * QR 코드 데이터는 일반적으로 JSON 형식으로 인코딩되어 있음
 * @param qrData QR 코드에서 스캔한 데이터
 * @returns 파싱된 QR 코드 데이터
 */
export const parseQRCodeData = (qrData: string): { storeId: number; timestamp: string } | null => {
    try {
        // QR 코드 데이터 파싱 (예: JSON 형식)
        const parsedData = JSON.parse(qrData);

        // 필수 필드 확인
        if (!parsedData.storeId || !parsedData.timestamp) {
            throw new Error('유효하지 않은 QR 코드 형식입니다.');
        }

        return {
            storeId: parsedData.storeId,
            timestamp: parsedData.timestamp
        };
    } catch (error) {
        console.error('QR 코드 데이터 파싱 실패:', error);
        return null;
    }
};

/**
 * QR 코드 유효성 검사
 * @param timestamp QR 코드 생성 시간
 * @param expiryMinutes QR 코드 유효 시간 (분)
 * @returns 유효 여부
 */
export const isQRCodeValid = (timestamp: string, expiryMinutes: number = 5): boolean => {
    try {
        const generatedTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const diffMinutes = (currentTime - generatedTime) / (1000 * 60);

        return diffMinutes <= expiryMinutes;
    } catch (error) {
        console.error('QR 코드 유효성 검사 실패:', error);
        return false;
    }
};
