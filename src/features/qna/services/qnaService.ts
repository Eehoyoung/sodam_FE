import api from '../../../common/utils/api';
import {Question, Answer, QuestionFilter, QuestionCategory, QuestionStatus} from '../types';

/**
 * Q&A 관련 서비스
 * 질문 및 답변 관리 기능을 제공합니다.
 */

// Q&A 서비스 객체
const qnaService = {
    /**
     * 모든 질문 목록 조회
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 질문 목록
     */
    getAllQuestions: async (page: number = 1, limit: number = 10): Promise<Question[]> => {
        try {
            const response = await api.get<Question[]>('/qna/questions', {page, limit});
            return response.data;
        } catch (error) {
            console.error('질문 목록을 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 특정 질문 상세 조회
     * @param questionId 질문 ID
     * @returns 질문 상세 정보
     */
    getQuestionById: async (questionId: string): Promise<Question> => {
        try {
            const response = await api.get<Question>(`/qna/questions/${questionId}`);
            return response.data;
        } catch (error) {
            console.error('질문 상세 정보를 가져오는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 질문 생성
     * @param question 질문 데이터
     * @returns 생성된 질문
     */
    createQuestion: async (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'answers'>): Promise<Question> => {
        try {
            const response = await api.post<Question>('/qna/questions', question);
            return response.data;
        } catch (error) {
            console.error('질문을 생성하는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 질문 수정
     * @param questionId 질문 ID
     * @param questionData 수정할 질문 데이터
     * @returns 수정된 질문
     */
    updateQuestion: async (questionId: string, questionData: Partial<Question>): Promise<Question> => {
        try {
            const response = await api.put<Question>(`/qna/questions/${questionId}`, questionData);
            return response.data;
        } catch (error) {
            console.error('질문을 수정하는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 질문 삭제
     * @param questionId 질문 ID
     */
    deleteQuestion: async (questionId: string): Promise<void> => {
        try {
            await api.delete(`/qna/questions/${questionId}`);
        } catch (error) {
            console.error('질문을 삭제하는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 답변 생성
     * @param questionId 질문 ID
     * @param answer 답변 데이터
     * @returns 생성된 답변
     */
    createAnswer: async (questionId: string, answer: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes'>): Promise<Answer> => {
        try {
            const response = await api.post<Answer>(`/qna/questions/${questionId}/answers`, answer);
            return response.data;
        } catch (error) {
            console.error('답변을 생성하는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 답변 수정
     * @param questionId 질문 ID
     * @param answerId 답변 ID
     * @param answerData 수정할 답변 데이터
     * @returns 수정된 답변
     */
    updateAnswer: async (questionId: string, answerId: string, answerData: Partial<Answer>): Promise<Answer> => {
        try {
            const response = await api.put<Answer>(`/qna/questions/${questionId}/answers/${answerId}`, answerData);
            return response.data;
        } catch (error) {
            console.error('답변을 수정하는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 답변 삭제
     * @param questionId 질문 ID
     * @param answerId 답변 ID
     */
    deleteAnswer: async (questionId: string, answerId: string): Promise<void> => {
        try {
            await api.delete(`/qna/questions/${questionId}/answers/${answerId}`);
        } catch (error) {
            console.error('답변을 삭제하는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 질문 필터링
     * @param filter 필터 조건
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 필터링된 질문 목록
     */
    filterQuestions: async (filter: QuestionFilter, page: number = 1, limit: number = 10): Promise<Question[]> => {
        try {
            const response = await api.get<Question[]>('/qna/questions/filter', {...filter, page, limit});
            return response.data;
        } catch (error) {
            console.error('질문을 필터링하는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 답변 채택
     * @param questionId 질문 ID
     * @param answerId 답변 ID
     * @returns 업데이트된 질문
     */
    acceptAnswer: async (questionId: string, answerId: string): Promise<Question> => {
        try {
            const response = await api.post<Question>(`/qna/questions/${questionId}/answers/${answerId}/accept`);
            return response.data;
        } catch (error) {
            console.error('답변을 채택하는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 답변 추천
     * @param questionId 질문 ID
     * @param answerId 답변 ID
     * @returns 업데이트된 답변
     */
    upvoteAnswer: async (questionId: string, answerId: string): Promise<Answer> => {
        try {
            const response = await api.post<Answer>(`/qna/questions/${questionId}/answers/${answerId}/upvote`);
            return response.data;
        } catch (error) {
            console.error('답변을 추천하는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },

    /**
     * 답변 비추천
     * @param questionId 질문 ID
     * @param answerId 답변 ID
     * @returns 업데이트된 답변
     */
    downvoteAnswer: async (questionId: string, answerId: string): Promise<Answer> => {
        try {
            const response = await api.post<Answer>(`/qna/questions/${questionId}/answers/${answerId}/downvote`);
            return response.data;
        } catch (error) {
            console.error('답변을 비추천하는 중 오류가 발생했습니다:', error);
            throw error;
        }
    },
};

export default qnaService;
