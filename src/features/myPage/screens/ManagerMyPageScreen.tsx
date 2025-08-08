import React, {useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const ManagerMyPageScreen = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>매니저 마이페이지</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
                    onPress={() => setActiveTab('profile')}
                >
                    <Text style={styles.tabButtonText}>프로필</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'store' && styles.activeTabButton]}
                    onPress={() => setActiveTab('store')}
                >
                    <Text style={styles.tabButtonText}>매장 관리</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'employee' && styles.activeTabButton]}
                    onPress={() => setActiveTab('employee')}
                >
                    <Text style={styles.tabButtonText}>직원 관리</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'schedule' && styles.activeTabButton]}
                    onPress={() => setActiveTab('schedule')}
                >
                    <Text style={styles.tabButtonText}>일정 관리</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === 'profile' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>프로필 정보</Text>
                        <Text style={styles.sectionContent}>매니저 프로필 정보가 표시됩니다.</Text>
                    </View>
                )}

                {activeTab === 'store' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>매장 관리</Text>
                        <Text style={styles.sectionContent}>매장 정보 및 통계가 표시됩니다.</Text>
                    </View>
                )}

                {activeTab === 'employee' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>직원 관리</Text>
                        <Text style={styles.sectionContent}>직원 목록 및 휴가 신청 관리가 표시됩니다.</Text>
                    </View>
                )}

                {activeTab === 'schedule' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>일정 관리</Text>
                        <Text style={styles.sectionContent}>근무 일정 및 업무 관리가 표시됩니다.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    activeTabButton: {
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
    },
    tabButtonText: {
        color: '#666',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    section: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
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
    sectionContent: {
        fontSize: 14,
        color: '#666',
    },
});

export default ManagerMyPageScreen;
