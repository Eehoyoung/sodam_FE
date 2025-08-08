import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../features/auth/screens/LoginScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';

export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * 인증 관련 화면들을 위한 네비게이터
 * 로그인, 회원가입 등의 화면을 포함
 */
const AuthNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Signup" component={SignupScreen}/>
        </Stack.Navigator>
    );
};

export default AuthNavigator;
