import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {memoryStorage} from './memoryStorage';

/**
 * API 클라이언트 설정
 * 모든 API 요청의 기본 설정을 관리합니다.
 */

// 기본 API URL 설정
// 환경에 따라 다른 URL 사용
const getBaseUrl = () => {
    if (__DEV__) {
        // 개발 환경
        return 'http://localhost:8080';
    } else {
        // 프로덕션 환경
        return 'https://api.sodam.com';
    }
};

const BASE_URL = getBaseUrl();

// API 클라이언트 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await memoryStorage.getItem('userToken');
            if (token) {
                config.headers.set('Authorization', `Bearer ${token}`);
            }
        } catch (error) {
            console.error('토큰을 가져오는 중 오류가 발생했습니다:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// 응답 인터셉터 설정
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        // 에러 처리 로직
        if (error.response) {
            // 서버 응답이 있는 경우
            const {status} = error.response;

            // 401 Unauthorized: 인증 실패
            if (status === 401) {
                // 토큰 만료 등의 이유로 로그아웃 처리
                memoryStorage.removeItem('userToken')
                    .catch(err => console.error('토큰 삭제 중 오류가 발생했습니다:', err));
                // 로그인 페이지로 리다이렉트 등의 처리
            }

            // 403 Forbidden: 권한 없음
            if (status === 403) {
                // 권한 없음 처리
            }

            // 500 Internal Server Error: 서버 오류
            if (status >= 500) {
                // 서버 오류 처리
            }
        } else if (error.request) {
            // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 오류 등)
            console.error('네트워크 오류가 발생했습니다.');
        } else {
            // 요청 설정 중 오류가 발생한 경우
            console.error('요청 설정 중 오류가 발생했습니다:', error.message);
        }

        return Promise.reject(error);
    }
);

// API 요청 함수들
export const api = {
    /**
     * GET 요청
     * @param url 요청 URL
     * @param params URL 파라미터
     * @param config 추가 설정
     */
    get: <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return apiClient.get<T>(url, {params, ...config});
    },

    /**
     * POST 요청
     * @param url 요청 URL
     * @param data 요청 데이터
     * @param config 추가 설정
     */
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return apiClient.post<T>(url, data, config);
    },

    /**
     * PUT 요청
     * @param url 요청 URL
     * @param data 요청 데이터
     * @param config 추가 설정
     */
    put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return apiClient.put<T>(url, data, config);
    },

    /**
     * DELETE 요청
     * @param url 요청 URL
     * @param config 추가 설정
     */
    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return apiClient.delete<T>(url, config);
    },

    /**
     * PATCH 요청
     * @param url 요청 URL
     * @param data 요청 데이터
     * @param config 추가 설정
     */
    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        return apiClient.patch<T>(url, data, config);
    },
};

export default api;
