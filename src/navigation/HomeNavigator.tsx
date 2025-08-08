import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../features/home/screens/HomeScreen';
import SubscribeScreen from '../features/subscription/screens/SubscribeScreen';
import QnAScreen from '../features/qna/screens/QnAScreen';
import LaborInfoDetailScreen from '../features/info/screens/LaborInfoDetailScreen';
import PolicyDetailScreen from '../features/info/screens/PolicyDetailScreen';
import TaxInfoDetailScreen from '../features/info/screens/TaxInfoDetailScreen';
import TipsDetailScreen from '../features/info/screens/TipsDetailScreen';
import EmployeeMyPageScreen from '../features/myPage/screens/EmployeeMyPageScreen';
import MasterMyPageScreen from '../features/myPage/screens/MasterMyPageScreen';
import ManagerMyPageScreen from '../features/myPage/screens/ManagerMyPageScreen';
import UserMyPageScreen from '../features/myPage/screens/UserMyPageScreen';
import Header from '../common/components/layout/Header';

export type HomeStackParamList = {
    Home: undefined;
    Subscribe: undefined;
    QnA: undefined;
    LaborInfoDetail: { laborInfoId: number };
    PolicyDetail: { policyId: number };
    TaxInfoDetail: { taxInfoId: number };
    TipsDetail: { tipId: number };
    EmployeeMyPageScreen: undefined;
    MasterMyPageScreen: undefined;
    ManagerMyPageScreen: undefined;
    UserMyPageScreen: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

/**
 * 메인 앱 화면들을 위한 네비게이터
 * 홈, 정보 상세, 마이페이지 등의 화면을 포함
 */
const HomeNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
                presentation: 'card',
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    headerShown: true,
                    header: () => <Header/>, // props 전달하지 않고 단순히 Header 컴포넌트만 렌더링
                }}
            />

            <Stack.Screen name="Subscribe" component={SubscribeScreen}/>
            <Stack.Screen name="QnA" component={QnAScreen}/>

            <Stack.Screen name="LaborInfoDetail" component={LaborInfoDetailScreen}/>
            <Stack.Screen name="PolicyDetail" component={PolicyDetailScreen}/>
            <Stack.Screen name="TaxInfoDetail" component={TaxInfoDetailScreen}/>
            <Stack.Screen name="TipsDetail" component={TipsDetailScreen}/>

            <Stack.Screen
                name="EmployeeMyPageScreen"
                component={EmployeeMyPageScreen}
                options={{headerShown: true}}
            />
            <Stack.Screen
                name="MasterMyPageScreen"
                component={MasterMyPageScreen}
                options={{headerShown: true}}
            />
            <Stack.Screen
                name="ManagerMyPageScreen"
                component={ManagerMyPageScreen}
                options={{headerShown: true}}
            />
            <Stack.Screen
                name="UserMyPageScreen"
                component={UserMyPageScreen}
                options={{headerShown: true}}
            />
        </Stack.Navigator>
    );
};

export default HomeNavigator;
