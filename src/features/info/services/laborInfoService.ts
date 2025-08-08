/**
 * 노동법 정보 관련 서비스
 * 노동법 정보 조회 및 관리 기능을 제공합니다.
 */

import api from '../../../common/utils/api';
import {LaborInfo, InfoCategory} from '../types';

// 노동법 정보 서비스 객체
const laborInfoService = {
    /**
     * 모든 노동법 정보 카테고리 조회
     * @returns 노동법 정보 카테고리 목록
     */
    getCategories: async (): Promise<InfoCategory[]> => {
        try {
            const response = await api.get<InfoCategory[]>('/labor-info/categories');
            return response.data;
        } catch (error) {
            console.error('노동법 정보 카테고리를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 카테고리의 노동법 정보 목록 조회
     * @param categoryId 카테고리 ID
     * @returns 노동법 정보 목록
     */
    getLaborInfosByCategory: async (categoryId: string): Promise<LaborInfo[]> => {
        try {
            const response = await api.get<LaborInfo[]>(`/labor-info/category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('카테고리별 노동법 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 노동법 정보 상세 조회
     * @param infoId 노동법 정보 ID
     * @returns 노동법 정보 상세
     */
    getLaborInfoById: async (infoId: string): Promise<LaborInfo> => {
        try {
            const response = await api.get<LaborInfo>(`/labor-info/${infoId}`);
            return response.data;
        } catch (error) {
            console.error('노동법 정보 상세를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 노동법 정보 검색
     * @param searchTerm 검색어
     * @returns 검색 결과 노동법 정보 목록
     */
    searchLaborInfo: async (searchTerm: string): Promise<LaborInfo[]> => {
        try {
            const response = await api.get<LaborInfo[]>('/labor-info/search', {query: searchTerm});
            return response.data;
        } catch (error) {
            console.error('노동법 정보 검색 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 최근 업데이트된 노동법 정보 조회
     * @param limit 조회할 항목 수
     * @returns 최근 업데이트된 노동법 정보 목록
     */
    getRecentLaborInfo: async (limit: number = 5): Promise<LaborInfo[]> => {
        try {
            const response = await api.get<LaborInfo[]>('/labor-info/recent', {limit});
            return response.data;
        } catch (error) {
            console.error('최근 노동법 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 인기 노동법 정보 조회
     * @param limit 조회할 항목 수
     * @returns 인기 노동법 정보 목록
     */
    getPopularLaborInfo: async (limit: number = 5): Promise<LaborInfo[]> => {
        try {
            const response = await api.get<LaborInfo[]>('/labor-info/popular', {limit});
            return response.data;
        } catch (error) {
            console.error('인기 노동법 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },
};

export default laborInfoService;
