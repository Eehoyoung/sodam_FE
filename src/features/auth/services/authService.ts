import api from '../../../common/utils/api';
import {unifiedStorage} from '../../../common/utils/unifiedStorage';

/**
 * 인증 관련 서비스
 * 로그인, 회원가입, 토큰 관리 등의 기능을 제공합니다.
 */

// 사용자 타입 정의
export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'EMPLOYEE' | 'MANAGER' | 'MASTER' | 'USER';
}

// 로그인 요청 타입
export interface LoginRequest {
    email: string;
    password: string;
}

// 회원가입 요청 타입
export interface SignupRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: 'EMPLOYEE' | 'MANAGER' | 'MASTER' | 'USER';
}

// 인증 응답 타입
export interface AuthResponse {
    user: User;
    token: string;
}

// 토큰 저장 함수
const saveToken = async (token: string): Promise<void> => {
    try {
        console.log('[DEBUG_LOG] Using unified storage for token save');
        await unifiedStorage.setItem('userToken', token);
    } catch (error) {
        console.error('[DEBUG_LOG] 토큰 저장 중 오류가 발생했습니다:', error);
    }
};

// 토큰 가져오기 함수
const getToken = async (): Promise<string | null> => {
    try {
        console.log('[DEBUG_LOG] Using unified storage for token retrieval');
        return await unifiedStorage.getItem('userToken');
    } catch (error) {
        console.error('[DEBUG_LOG] 토큰을 가져오는 중 오류가 발생했습니다:', error);
        return null;
    }
};

// 토큰 삭제 함수
const removeToken = async (): Promise<void> => {
    try {
        console.log('[DEBUG_LOG] Using unified storage for token removal');
        await unifiedStorage.removeItem('userToken');
    } catch (error) {
        console.error('[DEBUG_LOG] 토큰 삭제 중 오류가 발생했습니다:', error);
    }
};

// 인증 서비스 객체
const authService = {
    /**
     * 로그인
     * @param loginRequest 로그인 요청 데이터
     * @returns 인증 응답 (사용자 정보 및 토큰)
     */
    login: async (loginRequest: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', loginRequest);
            const {token} = response.data;
            await saveToken(token);
            return response.data;
        } catch (error) {
            console.error('로그인 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 카카오 로그인
     * @param code 카카오 인증 코드
     * @returns 인증 응답 (사용자 정보 및 토큰)
     */
    kakaoLogin: async (code: string): Promise<AuthResponse> => {
        try {
            const response = await api.get<AuthResponse>(`/kakao/auth/proc`, {code});
            const {token} = response.data;
            await saveToken(token);
            return response.data;
        } catch (error) {
            console.error('카카오 로그인 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 회원가입
     * @param signupRequest 회원가입 요청 데이터
     * @returns 인증 응답 (사용자 정보 및 토큰)
     */
    signup: async (signupRequest: SignupRequest): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/signup', signupRequest);
            const {token} = response.data;
            await saveToken(token);
            return response.data;
        } catch (error) {
            console.error('회원가입 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 로그아웃
     */
    logout: async (): Promise<void> => {
        await removeToken();
    },

    /**
     * 현재 사용자 정보 가져오기
     * @returns 사용자 정보
     */
    getCurrentUser: async (): Promise<User> => {
        try {
            const response = await api.get<User>('/auth/me');
            return response.data;
        } catch (error) {
            console.error('사용자 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 비밀번호 재설정 요청
     * @param email 사용자 이메일
     */
    requestPasswordReset: async (email: string): Promise<void> => {
        try {
            await api.post('/auth/password-reset-request', {email});
        } catch (error) {
            console.error('비밀번호 재설정 요청 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 비밀번호 재설정
     * @param token 재설정 토큰
     * @param newPassword 새 비밀번호
     */
    resetPassword: async (token: string, newPassword: string): Promise<void> => {
        try {
            await api.post('/auth/password-reset', {token, newPassword});
        } catch (error) {
            console.error('비밀번호 재설정 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 인증 상태 확인
     * @returns 인증 여부
     */
    isAuthenticated: async (): Promise<boolean> => {
        const token = await getToken();
        return !!token;
    },
};

export default authService;
