import React, {useState} from 'react';
import {Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Button} from '../../../common/components';

// 네비게이션 타입 정의
type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    MasterMyPageScreen: undefined;
    EmployeeMyPageScreen: undefined;
    ProfileEdit: undefined;
};

type UserMyPageScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * 일반 사용자 마이페이지 화면
 * 사용자 프로필 정보 표시 및 역할 전환 기능 제공
 */
const UserMyPageScreen: React.FC = () => {
    const navigation = useNavigation<UserMyPageScreenNavigationProp>();
    // TODO: API 연결 필요 - 사용자 정보를 가져오는 API 호출로 대체해야 함
    const [user] = useState({
        name: '홍길동',
        email: 'user@example.com',
        profileImageUrl: 'https://via.placeholder.com/150',
    });

    // 사장으로 전환 처리
    const handleConvertToMaster = () => {
        Alert.alert(
            '사장으로 전환',
            '사장 계정으로 전환하시겠습니까? 매장 관리 기능을 사용할 수 있습니다.',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '확인',
                    onPress: () => {
                        // TODO: API 연결 필요 - 사용자 역할을 사장으로 변경하는 API 호출로 대체해야 함
                        // 실제 구현에서는 API 호출로 역할 변경
                        Alert.alert('성공', '사장 계정으로 전환되었습니다.');
                        navigation.navigate('MasterMyPageScreen');
                    },
                },
            ]
        );
    };

    // 사원으로 전환 처리
    const handleConvertToEmployee = () => {
        Alert.alert(
            '사원으로 전환',
            '사원 계정으로 전환하시겠습니까? 매장에 소속되어 근무할 수 있습니다.',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '확인',
                    onPress: () => {
                        // TODO: API 연결 필요 - 사용자 역할을 사원으로 변경하는 API 호출로 대체해야 함
                        // 실제 구현에서는 API 호출로 역할 변경
                        Alert.alert('성공', '사원 계정으로 전환되었습니다.');
                        navigation.navigate('EmployeeMyPageScreen');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* 헤더 섹션 */}
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        <Image
                            source={
                                user?.profileImageUrl
                                    ? {uri: user.profileImageUrl}
                                    : {uri: 'https://via.placeholder.com/150'}
                            }
                            style={styles.profileImage}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user?.name || '사용자'}</Text>
                            <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
                            <Text style={styles.userRole}>일반 사용자</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('ProfileEdit')}
                    >
                        <Text style={styles.editButtonText}>프로필 수정</Text>
                    </TouchableOpacity>
                </View>

                {/* 역할 전환 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>역할 전환</Text>
                    <Text style={styles.sectionDescription}>
                        사장 또는 사원으로 전환하여 추가 기능을 사용할 수 있습니다.
                    </Text>
                    <View style={styles.roleButtonsContainer}>
                        <Button
                            title="사장으로 전환"
                            onPress={handleConvertToMaster}
                            type="primary"
                            style={styles.roleButton}
                        />
                        <Button
                            title="사원으로 전환"
                            onPress={handleConvertToEmployee}
                            type="secondary"
                            style={styles.roleButton}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#3498db',
        fontWeight: '500',
    },
    editButton: {
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    editButtonText: {
        color: '#3498db',
        fontSize: 14,
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        marginTop: 15,
        borderRadius: 10,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    roleButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    roleButton: {
        flex: 1,
        marginHorizontal: 5,
    },
});

export default UserMyPageScreen;
