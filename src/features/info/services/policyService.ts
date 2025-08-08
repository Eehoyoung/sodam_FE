/**
 * 정책 정보 관련 서비스
 * 정부 지원 정책 정보 조회 및 관리 기능을 제공합니다.
 */

import api from '../../../common/utils/api';
import {PolicyInfo, InfoCategory} from '../types';

// 정책 정보 서비스 객체
const policyService = {
    /**
     * 모든 정책 정보 카테고리 조회
     * @returns 정책 정보 카테고리 목록
     */
    getCategories: async (): Promise<InfoCategory[]> => {
        try {
            const response = await api.get<InfoCategory[]>('/policy/categories');
            return response.data;
        } catch (error) {
            console.error('정책 정보 카테고리를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 카테고리의 정책 정보 목록 조회
     * @param categoryId 카테고리 ID
     * @returns 정책 정보 목록
     */
    getPoliciesByCategory: async (categoryId: string): Promise<PolicyInfo[]> => {
        try {
            const response = await api.get<PolicyInfo[]>(`/policy/category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('카테고리별 정책 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 정책 정보 상세 조회
     * @param policyId 정책 정보 ID
     * @returns 정책 정보 상세
     */
    getPolicyById: async (policyId: string): Promise<PolicyInfo> => {
        try {
            const response = await api.get<PolicyInfo>(`/policy/${policyId}`);
            return response.data;
        } catch (error) {
            console.error('정책 정보 상세를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 정책 정보 검색
     * @param searchTerm 검색어
     * @returns 검색 결과 정책 정보 목록
     */
    searchPolicy: async (searchTerm: string): Promise<PolicyInfo[]> => {
        try {
            const response = await api.get<PolicyInfo[]>('/policy/search', {query: searchTerm});
            return response.data;
        } catch (error) {
            console.error('정책 정보 검색 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 최근 업데이트된 정책 정보 조회
     * @param limit 조회할 항목 수
     * @returns 최근 업데이트된 정책 정보 목록
     */
    getRecentPolicies: async (limit: number = 5): Promise<PolicyInfo[]> => {
        try {
            const response = await api.get<PolicyInfo[]>('/policy/recent', {limit});
            return response.data;
        } catch (error) {
            console.error('최근 정책 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 마감 임박 정책 정보 조회
     * @param limit 조회할 항목 수
     * @returns 마감 임박 정책 정보 목록
     */
    getDeadlinePolicies: async (limit: number = 5): Promise<PolicyInfo[]> => {
        try {
            const response = await api.get<PolicyInfo[]>('/policy/deadline', {limit});
            return response.data;
        } catch (error) {
            console.error('마감 임박 정책 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 지역별 정책 정보 조회
     * @param region 지역명
     * @returns 지역별 정책 정보 목록
     */
    getPoliciesByRegion: async (region: string): Promise<PolicyInfo[]> => {
        try {
            const response = await api.get<PolicyInfo[]>('/policy/region', {region});
            return response.data;
        } catch (error) {
            console.error('지역별 정책 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },
};

export default policyService;
