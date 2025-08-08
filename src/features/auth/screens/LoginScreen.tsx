import React, {useEffect, useState} from 'react';
import {Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Input, MainLayout} from '../../../common/components';
import {useAuth} from '../../../contexts/AuthContext';
import {LoginScreenNavigationProp, RootNavigationProp} from '../../../navigation/types';

// 캡챠 검증을 위한 간단한 컴포넌트
interface CaptchaVerificationProps {
    onVerify: (verified: boolean) => void;
}

const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({onVerify}) => {
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaCode, setCaptchaCode] = useState('');


    // 캡챠 코드 생성 함수
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaCode(result);
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleVerify = () => {
        if (captchaInput === captchaCode) {
            onVerify(true);
        } else {
            Alert.alert('캡챠 오류', '입력한 문자가 일치하지 않습니다. 다시 시도해주세요.');
            generateCaptcha();
            setCaptchaInput('');
        }
    };

    return (
        <View style={styles.captchaContainer}>
            <Text style={styles.captchaLabel}>보안 확인</Text>
            <View style={styles.captchaCodeContainer}>
                <Text style={styles.captchaCode}>{captchaCode}</Text>
                <TouchableOpacity onPress={generateCaptcha}>
                    <Text style={styles.refreshButton}>새로고침</Text>
                </TouchableOpacity>
            </View>
            <Input
                placeholder="위 문자를 입력하세요"
                value={captchaInput}
                onChangeText={setCaptchaInput}
            />
            <Button
                title="확인"
                onPress={handleVerify}
                size="small"
                style={{'marginTop': 10}}
            />
        </View>
    );
};

const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const rootNavigation = useNavigation<RootNavigationProp>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // AuthContext에서 인증 관련 함수들 가져오기
    const {login, kakaoLogin} = useAuth();

    // 로그인 처리 함수
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        // 캡챠가 필요하지만 검증되지 않은 경우
        if (showCaptcha && !captchaVerified) {
            Alert.alert('보안 확인 필요', '보안 문자를 먼저 입력해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            // AuthContext의 로그인 함수 호출
            await login(email, password);

            // 로그인 성공
            Alert.alert('로그인 성공', '환영합니다!', [
                {
                    text: '확인', onPress: () => rootNavigation.reset({
                        index: 0,
                        routes: [{name: 'Main'}],
                    })
                },
            ]);
        } catch (error) {
            // 로그인 실패
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);

            if (newAttempts >= 5) {
                setShowCaptcha(true);
                setCaptchaVerified(false);
            }

            Alert.alert('로그인 실패', '아이디 또는 비밀번호가 일치하지 않습니다.');
            setIsLoading(false);
        }
    };


    // 카카오 로그인 처리 함수
    const handleKakaoLogin = async () => {
        setIsLoading(true);

        try {
            // 실제로는 카카오 SDK를 사용하여 인증 코드를 받아야 함
            // 여기서는 테스트를 위해 더미 코드 사용
            await kakaoLogin('dummy_auth_code');

            // 로그인 성공
            Alert.alert('카카오 로그인 성공', '카카오 계정으로 로그인되었습니다.', [
                {
                    text: '확인', onPress: () => rootNavigation.reset({
                        index: 0,
                        routes: [{name: 'Main'}],
                    })
                },
            ]);
        } catch (error) {
            console.error('카카오 로그인 중 오류가 발생했습니다:', error);
            Alert.alert('카카오 로그인 실패', '카카오 로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 캡챠 검증 완료 처리
    const handleCaptchaVerified = (verified: boolean | ((prevState: boolean) => boolean)) => {
        setCaptchaVerified(verified);
    };

    return (
        <MainLayout>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logo}>소담</Text>
                    </View>

                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeTitle}>환영합니다!</Text>
                        <Text style={styles.welcomeSubtitle}>소담은 여러분들의 희망사다리가 되겠습니다.</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Input
                            label="이메일"
                            placeholder="이메일을 입력하세요"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            label="비밀번호"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            containerStyle={{"marginTop": 10}}
                        />

                        {showCaptcha && !captchaVerified && (
                            <CaptchaVerification onVerify={handleCaptchaVerified}/>
                        )}

                        <Button
                            title="로그인"
                            onPress={handleLogin}
                            type="primary"
                            fullWidth
                            loading={isLoading}
                            style={{marginTop: 20}}
                        />

                        <View style={styles.separator}>
                            <View style={styles.separatorLine}/>
                            <Text style={styles.separatorText}>또는</Text>
                            <View style={styles.separatorLine}/>
                        </View>

                        <Button
                            title="카카오로 로그인하기"
                            onPress={handleKakaoLogin}
                            type="secondary"
                            fullWidth
                            style={{
                                marginTop: 15,
                                backgroundColor: '#FEE500',
                            }}
                            textStyle={{color: '#3A1D1D'}}
                        />
                    </View>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Signup')}
                            style={styles.option}
                        >
                            <Text style={styles.optionText}>회원가입</Text>
                        </TouchableOpacity>

                        <Text style={styles.optionDivider}>|</Text>

                        <TouchableOpacity
                            onPress={() => Alert.alert('아이디 찾기', '아이디 찾기 기능은 준비 중입니다.')}
                            style={styles.option}
                        >
                            <Text style={styles.optionText}>아이디 찾기</Text>
                        </TouchableOpacity>

                        <Text style={styles.optionDivider}>|</Text>

                        <TouchableOpacity
                            onPress={() => Alert.alert('비밀번호 찾기', '비밀번호 찾기 기능은 준비 중입니다.')}
                            style={styles.option}
                        >
                            <Text style={styles.optionText}>비밀번호 찾기</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.securityInfoContainer}>
                        <Text style={styles.securityInfo}>
                            * 비밀번호 5회 오류 시 보안 인증이 필요합니다
                        </Text>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </MainLayout>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    logo: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#3498db',
    },
    welcomeContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 30,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    separatorText: {
        paddingHorizontal: 10,
        color: '#888',
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    option: {
        padding: 5,
    },
    optionText: {
        color: '#3498db',
        fontSize: 14,
    },
    optionDivider: {
        color: '#ddd',
        paddingHorizontal: 5,
    },
    securityInfoContainer: {
        marginTop: 20,
    },
    securityInfo: {
        fontSize: 12,
        color: '#888',
    },
    captchaContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    captchaLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    captchaCodeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    captchaCode: {
        fontSize: 20,
        letterSpacing: 5,
        fontWeight: 'bold',
        color: '#555',
    },
    refreshButton: {
        color: '#3498db',
        fontSize: 14,
    },
});

export default LoginScreen;
