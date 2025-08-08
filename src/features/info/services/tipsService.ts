/**
 * 팁 정보 관련 서비스
 * 유용한 팁과 가이드 정보 조회 및 관리 기능을 제공합니다.
 */

import api from '../../../common/utils/api';
import {TipsInfo, InfoCategory} from '../types';

// 팁 정보 서비스 객체
const tipsService = {
    /**
     * 모든 팁 정보 카테고리 조회
     * @returns 팁 정보 카테고리 목록
     */
    getCategories: async (): Promise<InfoCategory[]> => {
        try {
            const response = await api.get<InfoCategory[]>('/tips/categories');
            return response.data;
        } catch (error) {
            console.error('팁 정보 카테고리를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 카테고리의 팁 정보 목록 조회
     * @param categoryId 카테고리 ID
     * @returns 팁 정보 목록
     */
    getTipsByCategory: async (categoryId: string): Promise<TipsInfo[]> => {
        try {
            const response = await api.get<TipsInfo[]>(`/tips/category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('카테고리별 팁 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 팁 정보 상세 조회
     * @param tipId 팁 정보 ID
     * @returns 팁 정보 상세
     */
    getTipById: async (tipId: string): Promise<TipsInfo> => {
        try {
            const response = await api.get<TipsInfo>(`/tips/${tipId}`);
            return response.data;
        } catch (error) {
            console.error('팁 정보 상세를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 팁 정보 검색
     * @param searchTerm 검색어
     * @returns 검색 결과 팁 정보 목록
     */
    searchTips: async (searchTerm: string): Promise<TipsInfo[]> => {
        try {
            const response = await api.get<TipsInfo[]>('/tips/search', {query: searchTerm});
            return response.data;
        } catch (error) {
            console.error('팁 정보 검색 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 최근 업데이트된 팁 정보 조회
     * @param limit 조회할 항목 수
     * @returns 최근 업데이트된 팁 정보 목록
     */
    getRecentTips: async (limit: number = 5): Promise<TipsInfo[]> => {
        try {
            const response = await api.get<TipsInfo[]>('/tips/recent', {limit});
            return response.data;
        } catch (error) {
            console.error('최근 팁 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 인기 팁 정보 조회
     * @param limit 조회할 항목 수
     * @returns 인기 팁 정보 목록
     */
    getPopularTips: async (limit: number = 5): Promise<TipsInfo[]> => {
        try {
            const response = await api.get<TipsInfo[]>('/tips/popular', {limit});
            return response.data;
        } catch (error) {
            console.error('인기 팁 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 난이도별 팁 정보 조회
     * @param difficulty 난이도 ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')
     * @returns 해당 난이도의 팁 정보 목록
     */
    getTipsByDifficulty: async (difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): Promise<TipsInfo[]> => {
        try {
            const response = await api.get<TipsInfo[]>('/tips/difficulty', {difficulty});
            return response.data;
        } catch (error) {
            console.error('난이도별 팁 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },
};

export default tipsService;
