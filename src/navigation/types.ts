import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

// 루트 스택 파라미터 목록
export type RootStackParamList = {
    Welcome: undefined;  // 새로운 메인화면 (첫 방문자용)
    Auth: { screen?: keyof AuthStackParamList; params?: any };
    Main: undefined;
    // 기타 루트 레벨 화면...
};

// 인증 스택 파라미터 목록
export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
};

// 홈 스택 파라미터 목록
export type HomeStackParamList = {
    Home: undefined;
    Attendance: undefined;
    WorkplaceList: undefined;
    WorkplaceDetail: { workplaceId: string };
    SalaryList: undefined;
    InfoMain: undefined;
    // 기타 홈 스택 화면...
};

// 네비게이션 프롭 타입 정의
export type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
export type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;
export type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;
export type WorkplaceListScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'WorkplaceList'>;
export type WorkplaceDetailScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'WorkplaceDetail'>;
export type RootNavigationProp = StackNavigationProp<RootStackParamList>;

// 라우트 프롭 타입 정의 (필요한 경우)
export type WorkplaceDetailRouteProp = RouteProp<HomeStackParamList, 'WorkplaceDetail'>;
