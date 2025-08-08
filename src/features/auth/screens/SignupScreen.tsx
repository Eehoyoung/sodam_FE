import React, {useState} from 'react';
import {Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Button, Input, MainLayout} from '../../../common/components';
import authService from '../services/authService';

// 네비게이션 타입 정의
type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
};

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList>;

const SignupScreen = () => {
    const navigation = useNavigation<SignupScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // 오류 메시지 상태
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
    });

    // 이메일 형식 검증
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // 비밀번호 강도 검증 (8자 이상, 영문, 숫자, 특수문자 포함)
    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return passwordRegex.test(password);
    };

    // 전화번호 검증
    const validatePhone = (phone: string) => {
        const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
        return phoneRegex.test(phone);
    };

    // 아이디 중복 확인
    const checkEmailDuplicate = async () => {
        if (!email) {
            setErrors(prev => ({...prev, email: '이메일을 입력해주세요.'}));
            return;
        }

        if (!validateEmail(email)) {
            setErrors(prev => ({...prev, email: '유효한 이메일 형식이 아닙니다.'}));
            return;
        }

        setIsDuplicateChecking(true);

        /*todo 이메일 중복 확인 기능 Back-End 개발 필요*/
        try {
            // 실제 API 호출 구현 필요
            // const response = await authService.checkEmailDuplicate(email);

            // 임시 구현 (API 연동 전까지 사용)
            await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

            // 임의로 test@example.com만 중복으로 처리 (실제로는 API 응답에 따라 처리)
            const isDuplicate = email === 'test@example.com';

            if (isDuplicate) {
                setErrors(prev => ({...prev, email: '이미 사용중인 이메일입니다.'}));
                setIsEmailVerified(false);
            } else {
                setErrors(prev => ({...prev, email: ''}));
                setIsEmailVerified(true);
                Alert.alert('확인 완료', '사용 가능한 이메일입니다.');
            }
        } catch (error) {
            Alert.alert('오류', '중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsDuplicateChecking(false);
        }
    };

    // 입력값 검증
    const validateInputs = () => {
        let isValid = true;
        const newErrors = {
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
            phone: '',
        };

        // 이메일 검증
        if (!email) {
            newErrors.email = '이메일을 입력해주세요.';
            isValid = false;
        } else if (!validateEmail(email)) {
            newErrors.email = '유효한 이메일 형식이 아닙니다.';
            isValid = false;
        }

        if (!isEmailVerified) {
            newErrors.email = '이메일 중복 확인이 필요합니다.';
            isValid = false;
        }

        // 비밀번호 검증
        if (!password) {
            newErrors.password = '비밀번호를 입력해주세요.';
            isValid = false;
        } else if (!validatePassword(password)) {
            newErrors.password = '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.';
            isValid = false;
        }

        // 비밀번호 확인 검증
        if (password !== confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
            isValid = false;
        }

        // 이름 검증
        if (!name) {
            newErrors.name = '이름을 입력해주세요.';
            isValid = false;
        }

        // 전화번호 검증
        if (!phone) {
            newErrors.phone = '전화번호를 입력해주세요.';
            isValid = false;
        } else if (!validatePhone(phone)) {
            newErrors.phone = '유효한 전화번호 형식이 아닙니다.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // 전화번호 형식 자동 변환 (000-0000-0000)
    const formatPhone = (text: string) => {
        // 숫자만 추출
        const numbers = text.replace(/[^\d]/g, '');

        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 7) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        }
    };

    // 회원가입 처리
    const handleSignup = async () => {
        if (!validateInputs()) {
            return;
        }

        setIsLoading(true);

        try {
            // authService를 사용하여 회원가입 API 호출
            await authService.signup({
                email,
                password,
                name,
                phone: phone.replace(/-/g, ''), // 하이픈 제거
                role: 'USER', // 기본 역할 설정
            });

            Alert.alert(
                '회원가입 성공',
                '소담 서비스에 가입되었습니다. 로그인 페이지로 이동합니다.',
                [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );
        } catch (error) {
            console.error('회원가입 중 오류가 발생했습니다:', error);
            Alert.alert('오류', '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // 이메일 입력 처리 함수
    const handleEmailChange = (text: string) => {
        setEmail(text);
        setIsEmailVerified(false); // 이메일 변경 시 중복 확인 초기화

        // 실시간 검증
        if (!text) {
            setErrors(prev => ({...prev, email: '이메일을 입력해주세요.'}));
        } else if (!validateEmail(text)) {
            setErrors(prev => ({...prev, email: '유효한 이메일 형식이 아닙니다.'}));
        } else {
            setErrors(prev => ({...prev, email: ''}));
        }
    };

    return (
        <MainLayout>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.logo}>소담</Text>
                        <Text style={styles.welcomeTitle}>회원가입</Text>
                        <Text style={styles.welcomeSubtitle}>소상공인의 모든 정보를 담은 소담에 오신 것을 환영합니다.</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* 이메일 입력 */}
                        <View style={styles.emailContainer}>
                            <Input
                                label="아이디 (이메일)"
                                placeholder="예: example@email.com"
                                value={email}
                                onChangeText={handleEmailChange}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.email}
                                containerStyle={{flex: 1, marginRight: 8}}
                            />
                            <Button
                                title="중복확인"
                                onPress={checkEmailDuplicate}
                                type="outline"
                                size="small"
                                loading={isDuplicateChecking}
                                disabled={!email || !validateEmail(email) || isDuplicateChecking}
                                style={styles.duplicateButton}
                            />
                        </View>

                        {/* 비밀번호 입력 */}
                        <Input
                            label="비밀번호"
                            placeholder="8자 이상, 영문, 숫자, 특수문자 포함"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (!text) {
                                    setErrors(prev => ({...prev, password: '비밀번호를 입력해주세요.'}));
                                } else if (!validatePassword(text)) {
                                    setErrors(prev => ({...prev, password: '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.'}));
                                } else {
                                    setErrors(prev => ({...prev, password: ''}));
                                }
                            }}
                            secureTextEntry
                            error={errors.password}
                        />

                        {/* 비밀번호 확인 */}
                        <Input
                            label="비밀번호 확인"
                            placeholder="비밀번호를 다시 입력해주세요"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (password !== text) {
                                    setErrors(prev => ({...prev, confirmPassword: '비밀번호가 일치하지 않습니다.'}));
                                } else {
                                    setErrors(prev => ({...prev, confirmPassword: ''}));
                                }
                            }}
                            secureTextEntry
                            error={errors.confirmPassword}
                        />

                        {/* 이름 입력 */}
                        <Input
                            label="이름"
                            placeholder="이름을 입력해주세요"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (!text) {
                                    setErrors(prev => ({...prev, name: '이름을 입력해주세요.'}));
                                } else {
                                    setErrors(prev => ({...prev, name: ''}));
                                }
                            }}
                            error={errors.name}
                        />

                        {/* 전화번호 입력 */}
                        <Input
                            label="전화번호"
                            placeholder="예: 010-0000-0000"
                            value={phone}
                            onChangeText={(text) => {
                                const formattedPhone = formatPhone(text);
                                setPhone(formattedPhone);

                                if (!formattedPhone) {
                                    setErrors(prev => ({...prev, phone: '전화번호를 입력해주세요.'}));
                                } else if (!validatePhone(formattedPhone)) {
                                    setErrors(prev => ({...prev, phone: '유효한 전화번호 형식이 아닙니다.'}));
                                } else {
                                    setErrors(prev => ({...prev, phone: ''}));
                                }
                            }}
                            keyboardType="phone-pad"
                            error={errors.phone}
                        />

                        <Button
                            title="회원가입"
                            onPress={handleSignup}
                            type="primary"
                            loading={isLoading}
                            fullWidth
                            style={styles.signupButton}
                        />

                        <View style={styles.loginLinkContainer}>
                            <Text style={styles.loginText}>이미 계정이 있으신가요?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>로그인</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.policyContainer}>
                        <Text style={styles.policyText}>
                            회원가입 시 소담의 <Text style={styles.policyLink}>이용약관</Text> 및{' '}
                            <Text style={styles.policyLink}>개인정보처리방침</Text>에 동의하게 됩니다.
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
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    logo: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: 20,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        maxWidth: '80%',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    duplicateButton: {
        marginBottom: 16,
        height: 50,
        justifyContent: 'center',
    },
    signupButton: {
        marginTop: 20,
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        color: '#666',
    },
    loginLink: {
        color: '#3498db',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    policyContainer: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
    },
    policyText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
    policyLink: {
        color: '#3498db',
        textDecorationLine: 'underline',
    },
});

export default SignupScreen;
