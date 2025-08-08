import React from 'react';
import {Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
// useNavigation 타입을 import 합니다.
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

// AppNavigator.tsx 또는 타입 정의 파일에서 정의한 RootStackParamList 타입을 import 합니다.
import {RootStackParamList} from '../../../navigation/AppNavigator';
import {HomeStackParamList} from '../../../navigation/HomeNavigator';
import {useResponsiveStyles} from "../../../utils/responsive";
import {useAuth} from '../../../contexts/AuthContext';

// 복합 네비게이션 타입 정의
type HeaderNavigationProp = CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    StackNavigationProp<HomeStackParamList>
>;

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({title}) => {
    const {isSmallScreen, responsiveStyles} = useResponsiveStyles();
    const screenWidth = Dimensions.get('window').width;

    // AuthContext에서 인증 상태와 로그아웃 함수 가져오기
    const {isAuthenticated, user} = useAuth();

    // useNavigation 훅에 복합 네비게이션 타입을 명시합니다.
    const navigation = useNavigation<HeaderNavigationProp>();

    // 화면 크기에 따라 동적으로 스타일 조정
    const dynamicStyles = {
        header: {
            paddingHorizontal: isSmallScreen ? 15 : 30,
            paddingVertical: isSmallScreen ? 10 : 15,
        },
        logo: {
            fontSize: isSmallScreen ? 22 : 28,
        },
        navButtonText: {
            fontSize: isSmallScreen ? 14 : 16,
        },
        navButton: {
            marginLeft: isSmallScreen ? 10 : 20,
        }
    };

    // AuthContext에서 로그아웃 함수 가져오기
    const {logout} = useAuth();

    // 로그인/로그아웃 처리
    const handleAuthAction = () => {
        if (isAuthenticated) {
            // 로그아웃 처리
            Alert.alert(
                '로그아웃',
                '정말 로그아웃 하시겠습니까?',
                [
                    {
                        text: '취소',
                        style: 'cancel'
                    },
                    {
                        text: '확인',
                        onPress: async () => {
                            try {
                                await logout();
                                Alert.alert('알림', '로그아웃 되었습니다.');
                            } catch (error) {
                                console.error('로그아웃 중 오류가 발생했습니다:', error);
                                Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
                            }
                        }
                    }
                ]
            );
        } else {
            // 로그인 화면으로 이동
            navigation.navigate('Auth', {screen: 'Login'});
        }
    };

    // 마이페이지 이동 처리
    const handleMyPageNavigation = () => {
        if (!isAuthenticated) {
            Alert.alert('알림', '로그인이 필요한 서비스입니다.', [
                {
                    text: '확인',
                    onPress: () => navigation.navigate('Auth', {screen: 'Login'})
                }
            ]);
            return;
        }

        // 사용자 역할에 따라 다른 마이페이지로 이동
        if (user && user.role) {
            switch (user.role) {
                case 'EMPLOYEE':
                    navigation.navigate('EmployeeMyPageScreen');
                    break;
                case 'MANAGER':
                    navigation.navigate('ManagerMyPageScreen');
                    break;
                case 'MASTER':
                    navigation.navigate('MasterMyPageScreen');
                    break;
                default:
                    navigation.navigate('UserMyPageScreen');
            }
        } else {
            // 사용자 정보가 없는 경우 기본 마이페이지로 이동
            navigation.navigate('UserMyPageScreen');
        }
    };

    // 작은 화면에서는 일부 버튼만 표시
    const renderNavButtons = () => {
        if (screenWidth < 400) {
            return (
                <View style={styles.navButtons}>
                    <TouchableOpacity
                        style={[styles.navButton, dynamicStyles.navButton]}
                        onPress={handleAuthAction}
                    >
                        <Text style={[styles.navButtonText, dynamicStyles.navButtonText]}>
                            {isAuthenticated ? '로그아웃' : '로그인'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navButton, dynamicStyles.navButton]}
                        onPress={handleMyPageNavigation}
                    >
                        <Text style={[styles.navButtonText, dynamicStyles.navButtonText]}>마이페이지</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.navButtons}>
                <TouchableOpacity
                    style={[styles.navButton, dynamicStyles.navButton]}
                    onPress={handleAuthAction}
                >
                    <Text style={[styles.navButtonText, dynamicStyles.navButtonText]}>
                        {isAuthenticated ? '로그아웃' : '로그인'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navButton, dynamicStyles.navButton]}
                    onPress={() => navigation.navigate('QnA')}
                >
                    <Text style={[styles.navButtonText, dynamicStyles.navButtonText]}>Q&A</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navButton, dynamicStyles.navButton]}
                    onPress={() => navigation.navigate('Subscribe')}
                >
                    <Text style={[styles.navButtonText, dynamicStyles.navButtonText]}>구독하기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navButton, dynamicStyles.navButton]}
                    onPress={handleMyPageNavigation}
                >
                    <Text style={[styles.navButtonText, dynamicStyles.navButtonText]}>마이페이지</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.header, dynamicStyles.header]}>
            <View style={styles.leftContainer}>
                <Text style={[styles.logo, dynamicStyles.logo]}>SOODAM</Text>
                {title && <Text style={styles.title}>{title}</Text>}
            </View>
            {renderNavButtons()}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#3498db',
        width: '100%',
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 5,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 15,
    },
    navButtons: {
        flexDirection: 'row',
    },
    navButton: {},
    navButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
});

export default Header;
