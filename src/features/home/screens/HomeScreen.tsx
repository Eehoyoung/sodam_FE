import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {HomeScreenNavigationProp} from '../../../navigation/types';
import {useAuth} from '../../../contexts/AuthContext';
import {Card, Button} from '../../../common/components';
import {colors, spacing} from '../../../theme/theme';
import {Icon} from '../../../common/components/Icon';
import {useWorkplaces} from '../../workplace/hooks/useWorkplaces';
import {useSalary} from '../../salary/hooks/useSalary';
import {useAttendance} from '../../attendance/hooks/useAttendance';
import {formatCurrency} from '../../../utils/formatters';

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const {user} = useAuth();
    const {workplaces, isLoading: isWorkplacesLoading} = useWorkplaces();
    const {monthlySalary, isLoading: isSalaryLoading} = useSalary();
    const {todayAttendance, isLoading: isAttendanceLoading} = useAttendance();

    const handleAttendancePress = () => {
        navigation.navigate('Attendance');
    };

    const handleWorkplacePress = () => {
        navigation.navigate('WorkplaceList');
    };

    const handleSalaryPress = () => {
        navigation.navigate('SalaryList');
    };

    const handleInfoPress = () => {
        navigation.navigate('InfoMain');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>안녕하세요, {user?.name || '사용자'}님!</Text>
                <Text style={styles.subGreeting}>오늘도 좋은 하루 되세요.</Text>
            </View>

            <Card style={styles.quickActionsCard}>
                <Text style={styles.cardTitle}>빠른 작업</Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity style={styles.quickAction} onPress={handleAttendancePress}>
                        <Icon name="clock" size={24} color={colors.primary}/>
                        <Text style={styles.quickActionText}>출퇴근</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={handleWorkplacePress}>
                        <Icon name="building" size={24} color={colors.primary}/>
                        <Text style={styles.quickActionText}>매장</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={handleSalaryPress}>
                        <Icon name="money-bill" size={24} color={colors.primary}/>
                        <Text style={styles.quickActionText}>급여</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={handleInfoPress}>
                        <Icon name="info-circle" size={24} color={colors.primary}/>
                        <Text style={styles.quickActionText}>정보</Text>
                    </TouchableOpacity>
                </View>
            </Card>

            <Card style={styles.attendanceCard}>
                <Text style={styles.cardTitle}>오늘의 출퇴근</Text>
                {isAttendanceLoading ? (
                    <Text style={styles.loadingText}>로딩 중...</Text>
                ) : todayAttendance ? (
                    <View>
                        <View style={styles.attendanceRow}>
                            <Text style={styles.attendanceLabel}>출근 시간:</Text>
                            <Text style={styles.attendanceValue}>{todayAttendance.checkInTime || '미출근'}</Text>
                        </View>
                        <View style={styles.attendanceRow}>
                            <Text style={styles.attendanceLabel}>퇴근 시간:</Text>
                            <Text style={styles.attendanceValue}>{todayAttendance.checkOutTime || '미퇴근'}</Text>
                        </View>
                        <View style={styles.attendanceRow}>
                            <Text style={styles.attendanceLabel}>근무 시간:</Text>
                            <Text style={styles.attendanceValue}>{todayAttendance.workingHours || '0'}시간</Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.noDataText}>오늘 출근 기록이 없습니다.</Text>
                )}
                <Button
                    title={todayAttendance?.checkInTime ? (todayAttendance?.checkOutTime ? "출퇴근 기록 보기" : "퇴근하기") : "출근하기"}
                    onPress={handleAttendancePress}
                    style={styles.attendanceButton}
                />
            </Card>

            <Card style={styles.salaryCard}>
                <Text style={styles.cardTitle}>이번 달 예상 급여</Text>
                {isSalaryLoading ? (
                    <Text style={styles.loadingText}>로딩 중...</Text>
                ) : (
                    <View>
                        <Text style={styles.salaryAmount}>{formatCurrency(monthlySalary?.amount || 0)}</Text>
                        <View style={styles.salaryRow}>
                            <Text style={styles.salaryLabel}>근무 시간:</Text>
                            <Text style={styles.salaryValue}>{monthlySalary?.workingHours || 0}시간</Text>
                        </View>
                        <View style={styles.salaryRow}>
                            <Text style={styles.salaryLabel}>세금 및 공제:</Text>
                            <Text style={styles.salaryValue}>{formatCurrency(monthlySalary?.deductions || 0)}</Text>
                        </View>
                    </View>
                )}
                <Button title="급여 상세 보기" onPress={handleSalaryPress} style={styles.salaryButton}/>
            </Card>

            <Card style={styles.workplacesCard}>
                <Text style={styles.cardTitle}>내 매장</Text>
                {isWorkplacesLoading ? (
                    <Text style={styles.loadingText}>로딩 중...</Text>
                ) : workplaces && workplaces.length > 0 ? (
                    workplaces.slice(0, 2).map((workplace) => (
                        <TouchableOpacity
                            key={workplace.id}
                            style={styles.workplaceItem}
                            onPress={() => navigation.navigate('WorkplaceDetail', {workplaceId: workplace.id})}
                        >
                            <View style={styles.workplaceInfo}>
                                <Text style={styles.workplaceName}>{workplace.name}</Text>
                                <Text style={styles.workplaceAddress}>{workplace.address}</Text>
                            </View>
                            <Icon name="chevron-right" size={16} color={colors.textSecondary}/>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noDataText}>등록된 매장이 없습니다.</Text>
                )}
                {workplaces && workplaces.length > 2 && (
                    <Text style={styles.moreText}>외 {workplaces.length - 2}개 매장</Text>
                )}
                <Button title="매장 관리" onPress={handleWorkplacePress} style={styles.workplaceButton}/>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.lg,
        backgroundColor: colors.primary,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    subGreeting: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: spacing.xs,
    },
    quickActionsCard: {
        marginTop: -spacing.md,
        marginHorizontal: spacing.md,
        borderRadius: 12,
        padding: spacing.md,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.md,
        color: colors.text,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickAction: {
        width: '22%',
        alignItems: 'center',
        padding: spacing.sm,
        borderRadius: 8,
        backgroundColor: colors.background,
    },
    quickActionText: {
        marginTop: spacing.xs,
        fontSize: 12,
        color: colors.text,
    },
    attendanceCard: {
        marginTop: spacing.md,
        marginHorizontal: spacing.md,
        borderRadius: 12,
        padding: spacing.md,
    },
    attendanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    attendanceLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    attendanceValue: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    attendanceButton: {
        marginTop: spacing.md,
    },
    salaryCard: {
        marginTop: spacing.md,
        marginHorizontal: spacing.md,
        borderRadius: 12,
        padding: spacing.md,
    },
    salaryAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.sm,
    },
    salaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    salaryLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    salaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    salaryButton: {
        marginTop: spacing.md,
    },
    workplacesCard: {
        marginTop: spacing.md,
        marginHorizontal: spacing.md,
        marginBottom: spacing.lg,
        borderRadius: 12,
        padding: spacing.md,
    },
    workplaceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.background,
    },
    workplaceInfo: {
        flex: 1,
    },
    workplaceName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    workplaceAddress: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    workplaceButton: {
        marginTop: spacing.md,
    },
    loadingText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: spacing.md,
    },
    noDataText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginVertical: spacing.md,
    },
    moreText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'right',
        marginTop: spacing.xs,
    },
});

export default HomeScreen;
