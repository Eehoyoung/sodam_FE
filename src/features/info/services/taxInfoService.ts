/**
 * 세금 정보 관련 서비스
 * 세금 정보 조회 및 관리 기능을 제공합니다.
 */

import api from '../../../common/utils/api';
import {TaxInfo, InfoCategory} from '../types';

// 세금 정보 서비스 객체
const taxInfoService = {
    /**
     * 모든 세금 정보 카테고리 조회
     * @returns 세금 정보 카테고리 목록
     */
    getCategories: async (): Promise<InfoCategory[]> => {
        try {
            const response = await api.get<InfoCategory[]>('/tax-info/categories');
            return response.data;
        } catch (error) {
            console.error('세금 정보 카테고리를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 카테고리의 세금 정보 목록 조회
     * @param categoryId 카테고리 ID
     * @returns 세금 정보 목록
     */
    getTaxInfosByCategory: async (categoryId: string): Promise<TaxInfo[]> => {
        try {
            const response = await api.get<TaxInfo[]>(`/tax-info/category/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('카테고리별 세금 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 세금 정보 상세 조회
     * @param infoId 세금 정보 ID
     * @returns 세금 정보 상세
     */
    getTaxInfoById: async (infoId: string): Promise<TaxInfo> => {
        try {
            const response = await api.get<TaxInfo>(`/tax-info/${infoId}`);
            return response.data;
        } catch (error) {
            console.error('세금 정보 상세를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 세금 정보 검색
     * @param searchTerm 검색어
     * @returns 검색 결과 세금 정보 목록
     */
    searchTaxInfo: async (searchTerm: string): Promise<TaxInfo[]> => {
        try {
            const response = await api.get<TaxInfo[]>('/tax-info/search', {query: searchTerm});
            return response.data;
        } catch (error) {
            console.error('세금 정보 검색 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 최근 업데이트된 세금 정보 조회
     * @param limit 조회할 항목 수
     * @returns 최근 업데이트된 세금 정보 목록
     */
    getRecentTaxInfo: async (limit: number = 5): Promise<TaxInfo[]> => {
        try {
            const response = await api.get<TaxInfo[]>('/tax-info/recent', {limit});
            return response.data;
        } catch (error) {
            console.error('최근 세금 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 연도의 세금 정보 조회
     * @param year 연도
     * @returns 해당 연도의 세금 정보 목록
     */
    getTaxInfoByYear: async (year: string): Promise<TaxInfo[]> => {
        try {
            const response = await api.get<TaxInfo[]>('/tax-info/year', {year});
            return response.data;
        } catch (error) {
            console.error('연도별 세금 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 그룹에 적용되는 세금 정보 조회
     * @param group 적용 그룹 (예: 'EMPLOYEE', 'SELF_EMPLOYED')
     * @returns 해당 그룹에 적용되는 세금 정보 목록
     */
    getTaxInfoByGroup: async (group: string): Promise<TaxInfo[]> => {
        try {
            const response = await api.get<TaxInfo[]>('/tax-info/group', {group});
            return response.data;
        } catch (error) {
            console.error('그룹별 세금 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },
};

export default taxInfoService;
