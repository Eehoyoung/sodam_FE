import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import AuthNavigator, {AuthStackParamList} from './AuthNavigator';
import HomeNavigator from './HomeNavigator';
import HybridMainScreen from '../features/welcome/screens/HybridMainScreen';
import {useAuth} from '../contexts/AuthContext';

export type RootStackParamList = {
    Welcome: undefined;  // 새로운 메인화면 (첫 방문자용)
    Auth: { screen?: keyof AuthStackParamList; params?: any };
    Main: undefined;
    LaborInfoDetail: { laborInfoId: number };
    TaxInfoDetail: { taxInfoId: number };
    TipsDetail: { tipId: number };
    PolicyDetail: { policyId: number };
    QnA: undefined;
    Home: undefined;
};


const Stack = createStackNavigator<RootStackParamList>();

/**
 * 앱의 최상위 네비게이터
 * 인증 관련 화면과 메인 앱 화면을 분리하여 관리
 * AuthContext를 사용하여 인증 상태에 따라 적절한 화면을 표시
 */
const AppNavigator: React.FC = () => {
    // AuthContext에서 인증 상태, 로딩 상태, 첫 실행 여부 가져오기
    const {isAuthenticated, loading, isFirstLaunch} = useAuth();

    // 로딩 중에는 로딩 화면을 표시
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3"/>
                <Text style={styles.loadingText}>소담 앱을 시작하는 중...</Text>
            </View>
        );
    }

    // 초기 라우트 결정 로직
    const getInitialRoute = () => {
        if (isAuthenticated) return "Main";
        // if (isFirstLaunch) return "Welcome";
        return "Auth";
    };

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
                initialRouteName={getInitialRoute()}
            >
                {/* 웰컴 화면 (첫 방문자용 하이브리드 메인화면) */}
                <Stack.Screen name="Welcome" component={HybridMainScreen}/>

                {/* 인증 관련 화면 (로그인, 회원가입 등) */}
                <Stack.Screen name="Auth" component={AuthNavigator}/>

                {/* 메인 앱 화면 (홈, 정보 상세, 마이페이지 등) */}
                <Stack.Screen name="Main" component={HomeNavigator}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
});

export default AppNavigator;
