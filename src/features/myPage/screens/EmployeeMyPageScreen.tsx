import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {LineChart} from 'react-native-chart-kit';
import {Button} from '../../../common/components';

// 네비게이션 타입 정의
type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    AttendanceDetail: { storeId: number; month: string };
    PayslipDetail: { payrollId: number };
    ProfileEdit: undefined;
    NotificationSettings: undefined;
    ShiftPreference: { storeId: number };
    TimeOffRequest: { storeId: number };
    CareerCertificate: undefined;
};

type EmployeeMyPageScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// 매장 타입 정의
interface Store {
    id: number;
    name: string;
    address: string;
    hourlyWage: number;
    logoUrl?: string;
}

// 근무 통계 타입 정의
interface WorkStats {
    totalWorkDays: number;
    totalWorkHours: number;
    totalSalary: number;
    month: string;
}

// 급여 내역 타입 정의
interface Payroll {
    id: number;
    storeId: number;
    storeName: string;
    month: string;
    totalAmount: number;
    netAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'PAID';
    paymentDate: string | null;
}

// 출퇴근 기록 타입 정의
interface Attendance {
    id: number;
    date: string;
    checkIn: string;
    checkOut: string | null;
    workHours: number;
    storeId: number;
    storeName: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'MISSED';
}

// 위치 기반 출근 설정 타입
interface LocationSettings {
    enabled: boolean;
    radius: number;
}

// 휴가 신청 타입
interface TimeOff {
    id: number;
    storeId: number;
    storeName: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// 근무 선호도 타입
interface ShiftPreference {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    preferred: boolean;
}

const EmployeeMyPageScreen = () => {
    const navigation = useNavigation<EmployeeMyPageScreenNavigationProp>();

    // 상태 관리
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [workStats, setWorkStats] = useState<WorkStats | null>(null);
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
    const [monthlyWorkHours, setMonthlyWorkHours] = useState<{ month: string, hours: number }[]>([]);
    const [monthlySalary, setMonthlySalary] = useState<{ month: string, amount: number }[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>(
        new Date().toISOString().slice(0, 7) // 현재 연월(YYYY-MM)
    );
    const [locationSettings, setLocationSettings] = useState<LocationSettings>({
        enabled: false,
        radius: 100,
    });
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showTaxInfoModal, setShowTaxInfoModal] = useState(false);
    const [showShiftPreferenceModal, setShowShiftPreferenceModal] = useState(false);
    const [shiftPreferences, setShiftPreferences] = useState<ShiftPreference[]>([
        {dayOfWeek: '월요일', startTime: '09:00', endTime: '18:00', preferred: false},
        {dayOfWeek: '화요일', startTime: '09:00', endTime: '18:00', preferred: true},
        {dayOfWeek: '수요일', startTime: '09:00', endTime: '18:00', preferred: true},
        {dayOfWeek: '목요일', startTime: '09:00', endTime: '18:00', preferred: true},
        {dayOfWeek: '금요일', startTime: '09:00', endTime: '18:00', preferred: true},
        {dayOfWeek: '토요일', startTime: '09:00', endTime: '18:00', preferred: false},
        {dayOfWeek: '일요일', startTime: '09:00', endTime: '18:00', preferred: false},
    ]);
    const [timeOffRequests, _setTimeOffRequests] = useState<TimeOff[]>([
        {
            id: 1,
            storeId: 1,
            storeName: '소담 카페 강남점',
            startDate: '2023-12-25',
            endDate: '2023-12-26',
            reason: '개인 사유',
            status: 'APPROVED',
        },
        {
            id: 2,
            storeId: 1,
            storeName: '소담 카페 강남점',
            startDate: '2024-01-02',
            endDate: '2024-01-03',
            reason: '병가',
            status: 'PENDING',
        },
    ]);
    const [showTimeOffModal, setShowTimeOffModal] = useState(false);
    const [careerCertificates, _setCareerCertificates] = useState<{
        storeId: number,
        storeName: string,
        startDate: string,
        endDate: string | null
    }[]>([
        {storeId: 1, storeName: '소담 카페 강남점', startDate: '2022-05-15', endDate: null},
        {storeId: 3, storeName: '소담 베이커리 종로점', startDate: '2021-03-01', endDate: '2022-02-28'},
    ]);
    const [showCertificateModal, setShowCertificateModal] = useState(false);

    // 이전 6개월 목록 생성
    const getLastSixMonths = () => {
        const months = [];
        const currentDate = new Date();

        for (let i = 0; i < 6; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthString = date.toISOString().slice(0, 7);
            const displayText = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
            months.push({value: monthString, label: displayText});
        }

        return months;
    };

    const monthOptions = getLastSixMonths();

    // 데이터 로딩 함수
    const loadData = async () => {
        setIsLoading(true);
        try {
            // 실제 구현에서는 API 호출
            // 1. 근무 중인 매장 목록 조회
            await fetchStores();

            // 2. 선택된 매장이 있으면 해당 매장의 근무 통계 로드
            if (selectedStore) {
                await fetchWorkStats();
                await fetchRecentAttendance();
            }

            // 3. 급여 내역 로드
            await fetchPayrolls();

            // 4. 월별 근무 시간 및 급여 추이 데이터 로드
            await fetchMonthlyData();

        } catch (error) {
            Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
            console.error(error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // 매장 목록 조회 (임시 데이터)
    const fetchStores = async () => {
        // 실제 API 호출 대신 임시 데이터
        const storesData: Store[] = [
            {id: 1, name: '소담 카페 강남점', address: '서울시 강남구 역삼동 123-45', hourlyWage: 10000},
            {id: 2, name: '소담 레스토랑 홍대점', address: '서울시 마포구 서교동 345-67', hourlyWage: 11000},
            {id: 3, name: '소담 베이커리 종로점', address: '서울시 종로구 관철동 89-12', hourlyWage: 9860},
        ];

        setStores(storesData);

        // 아직 선택된 매장이 없으면 첫 번째 매장 선택
        if (!selectedStore && storesData.length > 0) {
            setSelectedStore(storesData[0]);
        }
    };

    // 근무 통계 조회 (임시 데이터)
    const fetchWorkStats = async () => {
        if (!selectedStore) {
            return;
        }

        // 실제 API 호출 대신 임시 데이터
        setTimeout(() => {
            const statsData: WorkStats = {
                totalWorkDays: 15,
                totalWorkHours: 120,
                totalSalary: 1200000,
                month: selectedMonth,
            };

            setWorkStats(statsData);
        }, 500);
    };

    // 급여 내역 조회 (임시 데이터)
    const fetchPayrolls = async () => {
        // 실제 API 호출 대신 임시 데이터
        setTimeout(() => {
            const payrollsData: Payroll[] = [
                {
                    id: 101,
                    storeId: 1,
                    storeName: '소담 카페 강남점',
                    month: '2023-10',
                    totalAmount: 1200000,
                    netAmount: 1080000,
                    status: 'PAID',
                    paymentDate: '2023-11-05',
                },
                {
                    id: 102,
                    storeId: 1,
                    storeName: '소담 카페 강남점',
                    month: '2023-09',
                    totalAmount: 1150000,
                    netAmount: 1035000,
                    status: 'PAID',
                    paymentDate: '2023-10-05',
                },
                {
                    id: 103,
                    storeId: 2,
                    storeName: '소담 레스토랑 홍대점',
                    month: '2023-10',
                    totalAmount: 550000,
                    netAmount: 495000,
                    status: 'PAID',
                    paymentDate: '2023-11-05',
                },
                {
                    id: 104,
                    storeId: 1,
                    storeName: '소담 카페 강남점',
                    month: '2023-11',
                    totalAmount: 840000,
                    netAmount: 756000,
                    status: 'PENDING',
                    paymentDate: null,
                },
            ];

            setPayrolls(payrollsData);
        }, 500);
    };

    // 최근 출퇴근 기록 조회 (임시 데이터)
    const fetchRecentAttendance = async () => {
        if (!selectedStore) {
            return;
        }

        // 실제 API 호출 대신 임시 데이터
        setTimeout(() => {
            const attendanceData: Attendance[] = [
                {
                    id: 1001,
                    date: '2023-11-15',
                    checkIn: '09:00',
                    checkOut: '18:00',
                    workHours: 8,
                    storeId: selectedStore.id,
                    storeName: selectedStore.name,
                    status: 'COMPLETED',
                },
                {
                    id: 1002,
                    date: '2023-11-14',
                    checkIn: '09:15',
                    checkOut: '18:30',
                    workHours: 8.25,
                    storeId: selectedStore.id,
                    storeName: selectedStore.name,
                    status: 'COMPLETED',
                },
                {
                    id: 1003,
                    date: '2023-11-13',
                    checkIn: '09:00',
                    checkOut: null,
                    workHours: 0,
                    storeId: selectedStore.id,
                    storeName: selectedStore.name,
                    status: 'IN_PROGRESS',
                },
                {
                    id: 1004,
                    date: '2023-11-12',
                    checkIn: '09:30',
                    checkOut: '17:30',
                    workHours: 7,
                    storeId: selectedStore.id,
                    storeName: selectedStore.name,
                    status: 'COMPLETED',
                },
            ];

            setRecentAttendance(attendanceData);
        }, 500);
    };

    // 월별 근무 시간 및 급여 추이 데이터 조회 (임시 데이터)
    const fetchMonthlyData = async () => {
        // 실제 API 호출 대신 임시 데이터
        setTimeout(() => {
            // 6개월 간의 근무 시간 데이터
            const hoursData = [
                {month: '2023-06', hours: 110},
                {month: '2023-07', hours: 130},
                {month: '2023-08', hours: 115},
                {month: '2023-09', hours: 125},
                {month: '2023-10', hours: 140},
                {month: '2023-11', hours: 120},
            ];

            // 6개월 간의 급여 데이터
            const salaryData = [
                {month: '2023-06', amount: 1100000},
                {month: '2023-07', amount: 1300000},
                {month: '2023-08', amount: 1150000},
                {month: '2023-09', amount: 1250000},
                {month: '2023-10', amount: 1400000},
                {month: '2023-11', amount: 1200000},
            ];

            setMonthlyWorkHours(hoursData);
            setMonthlySalary(salaryData);
        }, 500);
    };

    // 화면 로드 시 데이터 로딩
    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 매장 변경 시 해당 매장의 데이터 로딩
    useEffect(() => {
        if (selectedStore) {
            fetchWorkStats();
            fetchRecentAttendance();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStore, selectedMonth]);

    // 새로고침 처리
    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // 매장 선택 처리
    const handleStoreSelect = (store: Store) => {
        setSelectedStore(store);
    };

    // 급여명세서 상세 보기
    const handlePayrollDetail = (payrollId: number) => {
        navigation.navigate('PayslipDetail', {payrollId});
    };

    // 월 선택 처리
    const handleMonthSelect = (month: string) => {
        setSelectedMonth(month);
    };

    // 출퇴근 기록 상세 보기
    const handleAttendanceDetail = () => {
        if (selectedStore) {
            navigation.navigate('AttendanceDetail', {
                storeId: selectedStore.id,
                month: selectedMonth,
            });
        }
    };

    // 출근 처리
    const handleCheckIn = () => {
        Alert.alert(
            '출근 확인',
            `${selectedStore?.name}에 출근 처리하시겠습니까?`,
            [
                {text: '취소', style: 'cancel'},
                {
                    text: '확인',
                    onPress: () => {
                        // 실제 API 호출 구현 필요
                        Alert.alert('성공', '출근 처리되었습니다.');
                        // 데이터 갱신
                        loadData();
                    },
                },
            ]
        );
    };

    // 퇴근 처리
    const handleCheckOut = () => {
        Alert.alert(
            '퇴근 확인',
            `${selectedStore?.name}에서 퇴근 처리하시겠습니까?`,
            [
                {text: '취소', style: 'cancel'},
                {
                    text: '확인',
                    onPress: () => {
                        // 실제 API 호출 구현 필요
                        Alert.alert('성공', '퇴근 처리되었습니다.');
                        // 데이터 갱신
                        loadData();
                    },
                },
            ]
        );
    };

    // 세금 정보 안내 모달 열기
    const handleOpenTaxInfoModal = () => {
        setShowTaxInfoModal(true);
    };

    // 위치 기반 출퇴근 설정 모달 열기
    const handleOpenLocationModal = () => {
        setShowLocationModal(true);
    };

    // 위치 기반 출퇴근 설정 저장
    const handleSaveLocationSettings = () => {
        // 실제 API 호출 구현 필요
        Alert.alert('성공', '위치 기반 출퇴근 설정이 저장되었습니다.');
        setShowLocationModal(false);
    };

    // 근무 선호도 모달 열기
    const handleOpenShiftPreferenceModal = () => {
        setShowShiftPreferenceModal(true);
    };

    // 근무 선호도 저장
    const handleSaveShiftPreferences = () => {
        // 실제 API 호출 구현 필요
        Alert.alert('성공', '근무 선호도가 저장되었습니다.');
        setShowShiftPreferenceModal(false);
    };

    // 근무 선호도 설정 변경
    const handleToggleShiftPreference = (index: number) => {
        const updatedPreferences = [...shiftPreferences];
        updatedPreferences[index].preferred = !updatedPreferences[index].preferred;
        setShiftPreferences(updatedPreferences);
    };

    // 휴가 신청 모달 열기
    const handleOpenTimeOffModal = () => {
        setShowTimeOffModal(true);
    };

    // 휴가 신청 이동
    const handleTimeOffRequest = () => {
        if (selectedStore) {
            setShowTimeOffModal(false);
            navigation.navigate('TimeOffRequest', {storeId: selectedStore.id});
        }
    };

    // 경력 증명서 모달 열기
    const handleOpenCertificateModal = () => {
        setShowCertificateModal(true);
    };

    // 경력 증명서 발급 이동
    const handleCareerCertificate = () => {
        setShowCertificateModal(false);
        navigation.navigate('CareerCertificate');
    };

    // 매장 카드 렌더링
    const renderStoreCard = ({item}: { item: Store }) => {
        const isSelected = selectedStore?.id === item.id;

        return (
            <TouchableOpacity
                style={[
                    styles.storeCard,
                    isSelected && styles.selectedStoreCard,
                ]}
                onPress={() => handleStoreSelect(item)}
            >
                <View style={styles.storeLogoContainer}>
                    {item.logoUrl ? (
                        <Image source={{uri: item.logoUrl}} style={styles.storeLogo}/>
                    ) : (
                        <View style={styles.storeLogoPlaceholder}>
                            <Text style={styles.storeLogoText}>{item.name.charAt(0)}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{item.name}</Text>
                    <Text style={styles.storeAddress} numberOfLines={1}>{item.address}</Text>
                    <Text style={styles.storeWage}>시급: {item.hourlyWage.toLocaleString()}원</Text>
                </View>
                {isSelected && (
                    <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // 월 선택 버튼 렌더링
    const renderMonthOption = ({item}: { item: { value: string; label: string } }) => {
        const isSelected = selectedMonth === item.value;

        return (
            <TouchableOpacity
                style={[
                    styles.monthOption,
                    isSelected && styles.selectedMonthOption,
                ]}
                onPress={() => handleMonthSelect(item.value)}
            >
                <Text style={[
                    styles.monthOptionText,
                    isSelected && styles.selectedMonthOptionText,
                ]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    };

    // 급여 내역 아이템 렌더링
    const renderPayrollItem = ({item}: { item: Payroll }) => {
        const statusText = {
            'PENDING': '처리 중',
            'CONFIRMED': '확정',
            'PAID': '지급 완료',
        };

        const statusColors = {
            'PENDING': '#ffa502',
            'CONFIRMED': '#1e90ff',
            'PAID': '#2ed573',
        };

        const monthYear = new Date(item.month + '-01').toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
        });

        return (
            <TouchableOpacity
                style={styles.payrollItem}
                onPress={() => handlePayrollDetail(item.id)}
            >
                <View style={styles.payrollHeader}>
                    <Text style={styles.payrollMonth}>{monthYear} 급여</Text>
                    <View style={[
                        styles.payrollStatus,
                        {backgroundColor: statusColors[item.status]},
                    ]}>
                        <Text style={styles.payrollStatusText}>{statusText[item.status]}</Text>
                    </View>
                </View>

                <View style={styles.payrollStore}>
                    <Text style={styles.payrollStoreName}>{item.storeName}</Text>
                </View>

                <View style={styles.payrollDetails}>
                    <View style={styles.payrollDetail}>
                        <Text style={styles.payrollDetailLabel}>총 급여</Text>
                        <Text style={styles.payrollDetailValue}>{item.totalAmount.toLocaleString()}원</Text>
                    </View>
                    <View style={styles.payrollDetail}>
                        <Text style={styles.payrollDetailLabel}>실수령액</Text>
                        <Text style={styles.payrollDetailValue}>{item.netAmount.toLocaleString()}원</Text>
                    </View>
                </View>

                {item.paymentDate && (
                    <Text style={styles.payrollDate}>
                        지급일: {new Date(item.paymentDate).toLocaleDateString('ko-KR')}
                    </Text>
                )}

                <View style={styles.payrollActions}>
                    <Text style={styles.viewDetailsText}>상세 보기 ›</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // 출퇴근 기록 아이템 렌더링
    const renderAttendanceItem = ({item}: { item: Attendance }) => {
        const date = new Date(item.date).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
        });

        const statusColors = {
            'COMPLETED': '#2ed573',
            'IN_PROGRESS': '#1e90ff',
            'MISSED': '#ff4757',
        };

        const statusText = {
            'COMPLETED': '완료',
            'IN_PROGRESS': '근무 중',
            'MISSED': '미체크',
        };

        return (
            <View style={styles.attendanceItem}>
                <View style={styles.attendanceDate}>
                    <Text style={styles.attendanceDateText}>{date}</Text>
                    <View style={[
                        styles.attendanceStatus,
                        {backgroundColor: statusColors[item.status]},
                    ]}>
                        <Text style={styles.attendanceStatusText}>{statusText[item.status]}</Text>
                    </View>
                </View>

                <View style={styles.attendanceTimes}>
                    <View style={styles.attendanceTime}>
                        <Text style={styles.attendanceTimeLabel}>출근</Text>
                        <Text style={styles.attendanceTimeValue}>{item.checkIn}</Text>
                    </View>
                    <View style={styles.attendanceTimeSeparator}/>
                    <View style={styles.attendanceTime}>
                        <Text style={styles.attendanceTimeLabel}>퇴근</Text>
                        <Text style={styles.attendanceTimeValue}>
                            {item.checkOut || '-'}
                        </Text>
                    </View>
                </View>

                <View style={styles.attendanceHours}>
                    <Text style={styles.attendanceHoursLabel}>근무시간</Text>
                    <Text style={styles.attendanceHoursValue}>
                        {item.status === 'COMPLETED' ? `${item.workHours}시간` : '-'}
                    </Text>
                </View>
            </View>
        );
    };

    // 휴가 신청 아이템 렌더링
    const renderTimeOffItem = ({item}: { item: TimeOff }) => {
        const statusText = {
            'PENDING': '검토 중',
            'APPROVED': '승인됨',
            'REJECTED': '반려됨',
        };

        const statusColors = {
            'PENDING': '#ffa502',
            'APPROVED': '#2ed573',
            'REJECTED': '#ff4757',
        };

        const startDate = new Date(item.startDate).toLocaleDateString('ko-KR');
        const endDate = new Date(item.endDate).toLocaleDateString('ko-KR');

        return (
            <View style={styles.timeOffItem}>
                <View style={styles.timeOffHeader}>
                    <Text style={styles.timeOffPeriod}>
                        {startDate} ~ {endDate}
                    </Text>
                    <View style={[
                        styles.timeOffStatus,
                        {backgroundColor: statusColors[item.status]},
                    ]}>
                        <Text style={styles.timeOffStatusText}>{statusText[item.status]}</Text>
                    </View>
                </View>
                <View style={styles.timeOffStore}>
                    <Text style={styles.timeOffStoreName}>{item.storeName}</Text>
                </View>
                <View style={styles.timeOffReason}>
                    <Text style={styles.timeOffReasonLabel}>사유:</Text>
                    <Text style={styles.timeOffReasonText}>{item.reason}</Text>
                </View>
            </View>
        );
    };

    // 현재 출근 중인지 확인
    const isCurrentlyWorking = recentAttendance.some(
        attendance =>
            attendance.status === 'IN_PROGRESS' &&
            new Date(attendance.date).toDateString() === new Date().toDateString()
    );

    // 차트 데이터 준비
    const workHoursChartData = {
        labels: monthlyWorkHours.map(item => item.month.substring(5)), // 월만 표시 (MM)
        datasets: [
            {
                data: monthlyWorkHours.map(item => item.hours),
                color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                strokeWidth: 2,
            },
        ],
        legend: ['근무 시간 (시간)'],
    };

    const salaryChartData = {
        labels: monthlySalary.map(item => item.month.substring(5)), // 월만 표시 (MM)
        datasets: [
            {
                data: monthlySalary.map(item => item.amount / 10000), // 만원 단위로 표시
                color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
                strokeWidth: 2,
            },
        ],
        legend: ['급여 (만원)'],
    };

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
        },
    };

    // 근무 선호도 렌더링
    const renderShiftPreference = () => {
        return (
            <View style={styles.shiftPreferenceContainer}>
                {shiftPreferences.map((pref, index) => (
                    <TouchableOpacity
                        key={pref.dayOfWeek}
                        style={[
                            styles.shiftPreferenceItem,
                            pref.preferred && styles.shiftPreferenceItemSelected,
                        ]}
                        onPress={() => handleToggleShiftPreference(index)}
                    >
                        <Text style={styles.shiftPreferenceDay}>{pref.dayOfWeek}</Text>
                        <Text style={styles.shiftPreferenceTime}>
                            {pref.startTime} - {pref.endTime}
                        </Text>
                        <View style={[
                            styles.shiftPreferenceStatus,
                            pref.preferred && styles.shiftPreferenceStatusSelected,
                        ]}>
                            <Text style={[
                                styles.shiftPreferenceStatusText,
                                pref.preferred && styles.shiftPreferenceStatusTextSelected,
                            ]}>
                                {pref.preferred ? '선호' : '비선호'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
                }
            >
                {/* 사용자 프로필 */}
                <View style={styles.profileSection}>
                    <View style={styles.profileHeader}>
                        <View style={styles.profileInfo}>
                            <View style={styles.profileImageContainer}>
                                <Image
                                    // source={require('../../assets/profile-placeholder.png')}
                                    style={styles.profileImage}
                                />
                            </View>
                            <View style={styles.profileDetails}>
                                <Text style={styles.profileName}>김소담</Text>
                                <Text style={styles.profileEmail}>sodam.kim@example.com</Text>
                                <TouchableOpacity
                                    style={styles.editProfileButton}
                                    onPress={() => navigation.navigate('ProfileEdit')}
                                >
                                    <Text style={styles.editProfileText}>프로필 수정</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 근무 매장 선택 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>근무 매장</Text>
                    </View>
                    <FlatList
                        data={stores}
                        renderItem={renderStoreCard}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.storeListContainer}
                    />
                </View>

                {/* 출퇴근 버튼 */}
                {selectedStore && (
                    <View style={styles.attendanceActions}>
                        <Button
                            title="출근하기"
                            onPress={handleCheckIn}
                            type={isCurrentlyWorking ? 'outline' : 'primary'}
                            style={styles.attendanceButton}
                            disabled={isCurrentlyWorking}
                        />
                        <Button
                            title="퇴근하기"
                            onPress={handleCheckOut}
                            type={!isCurrentlyWorking ? 'outline' : 'primary'}
                            style={styles.attendanceButton}
                            disabled={!isCurrentlyWorking}
                        />
                    </View>
                )}

                {/* 위치 기반 출퇴근 설정 */}
                <TouchableOpacity
                    style={styles.locationSettingsButton}
                    onPress={handleOpenLocationModal}
                >
                    <Text style={styles.locationSettingsText}>
                        {locationSettings.enabled ? '위치 기반 자동 출퇴근 켜짐' : '위치 기반 자동 출퇴근 꺼짐'}
                    </Text>
                    <Text style={styles.locationSettingsIcon}>⚙️</Text>
                </TouchableOpacity>

                {/* 월 선택 */}
                <View style={styles.monthSelector}>
                    <FlatList
                        data={monthOptions}
                        renderItem={renderMonthOption}
                        keyExtractor={(item) => item.value}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.monthOptionsContainer}
                    />
                </View>

                {/* 근무 통계 */}
                {selectedStore && workStats && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {new Date(selectedMonth + '-01').toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                })} 근무 통계
                            </Text>
                            <TouchableOpacity onPress={handleAttendanceDetail}>
                                <Text style={styles.viewAllLink}>전체보기</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{workStats.totalWorkDays}일</Text>
                                <Text style={styles.statLabel}>근무일수</Text>
                            </View>
                            <View style={styles.statDivider}/>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{workStats.totalWorkHours}시간</Text>
                                <Text style={styles.statLabel}>근무시간</Text>
                            </View>
                            <View style={styles.statDivider}/>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{workStats.totalSalary.toLocaleString()}원</Text>
                                <Text style={styles.statLabel}>총 급여(세후)</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* 최근 출퇴근 기록 */}
                {selectedStore && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>최근 출퇴근 기록</Text>
                            <TouchableOpacity onPress={handleAttendanceDetail}>
                                <Text style={styles.viewAllLink}>전체보기</Text>
                            </TouchableOpacity>
                        </View>

                        {recentAttendance.length > 0 ? (
                            <FlatList
                                data={recentAttendance}
                                renderItem={renderAttendanceItem}
                                keyExtractor={(item) => item.id.toString()}
                                scrollEnabled={false}
                                contentContainerStyle={styles.attendanceListContainer}
                            />
                        ) : (
                            <Text style={styles.emptyListText}>출퇴근 기록이 없습니다.</Text>
                        )}
                    </View>
                )}

                {/* 급여 내역 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>급여 내역</Text>
                        <TouchableOpacity onPress={handleOpenTaxInfoModal}>
                            <Text style={styles.viewAllLink}>세금 정보</Text>
                        </TouchableOpacity>
                    </View>

                    {payrolls.length > 0 ? (
                        <FlatList
                            data={payrolls}
                            renderItem={renderPayrollItem}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                            contentContainerStyle={styles.payrollListContainer}
                        />
                    ) : (
                        <Text style={styles.emptyListText}>급여 내역이 없습니다.</Text>
                    )}
                </View>

                {/* 근무 시간 추이 차트 */}
                {monthlyWorkHours.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>근무 시간 추이</Text>
                        </View>
                        <View style={styles.chartContainer}>
                            <LineChart
                                data={workHoursChartData}
                                width={styles.chart.width}
                                height={styles.chart.height}
                                chartConfig={chartConfig}
                                bezier
                                style={styles.chart}
                            />
                        </View>
                    </View>
                )}

                {/* 급여 추이 차트 */}
                {monthlySalary.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>급여 추이</Text>
                        </View>
                        <View style={styles.chartContainer}>
                            <LineChart
                                data={salaryChartData}
                                width={styles.chart.width}
                                height={styles.chart.height}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
                                }}
                                bezier
                                style={styles.chart}
                            />
                        </View>
                    </View>
                )}

                {/* 근무 선호도 설정 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>근무 선호도</Text>
                        <TouchableOpacity onPress={handleOpenShiftPreferenceModal}>
                            <Text style={styles.viewAllLink}>설정</Text>
                        </TouchableOpacity>
                    </View>
                    {renderShiftPreference()}
                </View>

                {/* 휴가 신청 내역 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>휴가 신청 내역</Text>
                        <TouchableOpacity onPress={handleOpenTimeOffModal}>
                            <Text style={styles.viewAllLink}>신청</Text>
                        </TouchableOpacity>
                    </View>

                    {timeOffRequests.length > 0 ? (
                        <FlatList
                            data={timeOffRequests}
                            renderItem={renderTimeOffItem}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                            contentContainerStyle={styles.timeOffListContainer}
                        />
                    ) : (
                        <Text style={styles.emptyListText}>휴가 신청 내역이 없습니다.</Text>
                    )}
                </View>

                {/* 경력 증명서 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>경력 증명서</Text>
                        <TouchableOpacity onPress={handleOpenCertificateModal}>
                            <Text style={styles.viewAllLink}>발급</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.certificateInfo}>
                        <Text style={styles.certificateInfoText}>
                            근무 이력을 바탕으로 경력 증명서를 발급받을 수 있습니다.
                        </Text>
                        <Text style={styles.certificateInfoText}>
                            발급된 증명서는 PDF 형식으로 저장되며, 이메일로도 전송됩니다.
                        </Text>
                    </View>

                    <View style={styles.certificateList}>
                        {careerCertificates.map((cert, index) => (
                            <View key={index} style={styles.certificateItem}>
                                <Text style={styles.certificateStoreName}>{cert.storeName}</Text>
                                <Text style={styles.certificatePeriod}>
                                    {new Date(cert.startDate).toLocaleDateString('ko-KR')} ~
                                    {cert.endDate ? new Date(cert.endDate).toLocaleDateString('ko-KR') : '현재'}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 위치 기반 출퇴근 설정 모달 */}
                <Modal
                    visible={showLocationModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowLocationModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>위치 기반 출퇴근 설정</Text>
                                <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                                    <Text style={styles.modalCloseButton}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <View style={styles.settingItem}>
                                    <Text style={styles.settingLabel}>위치 기반 자동 출퇴근</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleButton,
                                            locationSettings.enabled && styles.toggleButtonActive,
                                        ]}
                                        onPress={() => setLocationSettings({
                                            ...locationSettings,
                                            enabled: !locationSettings.enabled,
                                        })}
                                    >
                                        <View style={[
                                            styles.toggleThumb,
                                            locationSettings.enabled && styles.toggleThumbActive,
                                        ]}/>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.settingDescription}>
                                    매장 반경 내에 진입하면 자동으로 출근 처리되고, 매장을 벗어나면 자동으로 퇴근 처리됩니다.
                                </Text>

                                <View style={styles.settingItem}>
                                    <Text style={styles.settingLabel}>인식 반경 설정</Text>
                                    <Text style={styles.settingValue}>{locationSettings.radius}m</Text>
                                </View>

                                <View style={styles.radiusSliderContainer}>
                                    <Text style={styles.radiusValue}>50m</Text>
                                    <View style={styles.radiusSlider}>
                                        {/* 실제 구현에서는 Slider 컴포넌트 사용 */}
                                        <View style={styles.radiusSliderTrack}>
                                            <View style={[
                                                styles.radiusSliderFill,
                                                {width: `${(locationSettings.radius - 50) / 150 * 100}%`},
                                            ]}/>
                                        </View>
                                        <View style={[
                                            styles.radiusSliderThumb,
                                            {left: `${(locationSettings.radius - 50) / 150 * 100}%`},
                                        ]}/>
                                    </View>
                                    <Text style={styles.radiusValue}>200m</Text>
                                </View>

                                <Text style={styles.settingDescription}>
                                    인식 반경이 클수록 매장에서 멀리 떨어진 곳에서도 출퇴근 처리가 가능합니다.
                                </Text>
                            </View>

                            <View style={styles.modalFooter}>
                                <Button
                                    title="저장"
                                    onPress={handleSaveLocationSettings}
                                    type="primary"
                                    style={styles.modalButton}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* 세금 정보 모달 */}
                <Modal
                    visible={showTaxInfoModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowTaxInfoModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>세금 정보</Text>
                                <TouchableOpacity onPress={() => setShowTaxInfoModal(false)}>
                                    <Text style={styles.modalCloseButton}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <Text style={styles.taxInfoTitle}>급여에서 공제되는 세금 항목</Text>

                                <View style={styles.taxInfoItem}>
                                    <Text style={styles.taxInfoName}>소득세</Text>
                                    <Text style={styles.taxInfoDescription}>
                                        근로소득에 대해 부과되는 세금으로, 급여 수준에 따라 세율이 달라집니다.
                                    </Text>
                                </View>

                                <View style={styles.taxInfoItem}>
                                    <Text style={styles.taxInfoName}>지방소득세</Text>
                                    <Text style={styles.taxInfoDescription}>
                                        소득세의 10%에 해당하는 금액으로, 지방자치단체에 납부됩니다.
                                    </Text>
                                </View>

                                <View style={styles.taxInfoItem}>
                                    <Text style={styles.taxInfoName}>국민연금</Text>
                                    <Text style={styles.taxInfoDescription}>
                                        노후 생활 보장을 위한 연금으로, 급여의 4.5%가 공제됩니다.
                                    </Text>
                                </View>

                                <View style={styles.taxInfoItem}>
                                    <Text style={styles.taxInfoName}>건강보험</Text>
                                    <Text style={styles.taxInfoDescription}>
                                        의료 서비스 이용을 위한 보험으로, 급여의 3.545%가 공제됩니다.
                                    </Text>
                                </View>

                                <View style={styles.taxInfoItem}>
                                    <Text style={styles.taxInfoName}>장기요양보험</Text>
                                    <Text style={styles.taxInfoDescription}>
                                        노인성 질병에 대한 요양 서비스를 위한 보험으로, 건강보험료의 12.81%가 공제됩니다.
                                    </Text>
                                </View>

                                <View style={styles.taxInfoItem}>
                                    <Text style={styles.taxInfoName}>고용보험</Text>
                                    <Text style={styles.taxInfoDescription}>
                                        실업 급여 등을 위한 보험으로, 급여의 0.9%가 공제됩니다.
                                    </Text>
                                </View>

                                <Text style={styles.taxInfoNote}>
                                    * 세금 공제율은 정부 정책에 따라 변경될 수 있습니다.
                                </Text>
                            </View>

                            <View style={styles.modalFooter}>
                                <Button
                                    title="확인"
                                    onPress={() => setShowTaxInfoModal(false)}
                                    type="primary"
                                    style={styles.modalButton}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* 근무 선호도 설정 모달 */}
                <Modal
                    visible={showShiftPreferenceModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowShiftPreferenceModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>근무 선호도 설정</Text>
                                <TouchableOpacity onPress={() => setShowShiftPreferenceModal(false)}>
                                    <Text style={styles.modalCloseButton}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <Text style={styles.shiftPreferenceDescription}>
                                    선호하는 근무 요일과 시간을 설정하세요. 매장 관리자가 스케줄 작성 시 참고합니다.
                                </Text>

                                <View style={styles.shiftPreferenceList}>
                                    {shiftPreferences.map((pref, index) => (
                                        <View key={pref.dayOfWeek} style={styles.shiftPreferenceModalItem}>
                                            <View style={styles.shiftPreferenceModalDay}>
                                                <Text style={styles.shiftPreferenceModalDayText}>{pref.dayOfWeek}</Text>
                                            </View>
                                            <View style={styles.shiftPreferenceModalTime}>
                                                <Text style={styles.shiftPreferenceModalTimeText}>
                                                    {pref.startTime} - {pref.endTime}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={[
                                                    styles.shiftPreferenceModalToggle,
                                                    pref.preferred && styles.shiftPreferenceModalToggleSelected,
                                                ]}
                                                onPress={() => handleToggleShiftPreference(index)}
                                            >
                                                <Text style={[
                                                    styles.shiftPreferenceModalToggleText,
                                                    pref.preferred && styles.shiftPreferenceModalToggleTextSelected,
                                                ]}>
                                                    {pref.preferred ? '선호' : '비선호'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.modalFooter}>
                                <Button
                                    title="저장"
                                    onPress={handleSaveShiftPreferences}
                                    type="primary"
                                    style={styles.modalButton}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* 휴가 신청 모달 */}
                <Modal
                    visible={showTimeOffModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowTimeOffModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>휴가 신청</Text>
                                <TouchableOpacity onPress={() => setShowTimeOffModal(false)}>
                                    <Text style={styles.modalCloseButton}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <Text style={styles.timeOffDescription}>
                                    휴가를 신청하시겠습니까?
                                </Text>
                                <Text style={styles.timeOffDescription}>
                                    휴가 신청 페이지로 이동합니다.
                                </Text>
                            </View>

                            <View style={styles.modalFooter}>
                                <Button
                                    title="취소"
                                    onPress={() => setShowTimeOffModal(false)}
                                    type="outline"
                                    style={styles.modalButtonHalf}
                                />
                                <Button
                                    title="신청하기"
                                    onPress={handleTimeOffRequest}
                                    type="primary"
                                    style={styles.modalButtonHalf}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* 경력 증명서 모달 */}
                <Modal
                    visible={showCertificateModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowCertificateModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>경력 증명서 발급</Text>
                                <TouchableOpacity onPress={() => setShowCertificateModal(false)}>
                                    <Text style={styles.modalCloseButton}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <Text style={styles.certificateModalDescription}>
                                    경력 증명서를 발급하시겠습니까?
                                </Text>
                                <Text style={styles.certificateModalDescription}>
                                    경력 증명서 발급 페이지로 이동합니다.
                                </Text>
                            </View>

                            <View style={styles.modalFooter}>
                                <Button
                                    title="취소"
                                    onPress={() => setShowCertificateModal(false)}
                                    type="outline"
                                    style={styles.modalButtonHalf}
                                />
                                <Button
                                    title="발급하기"
                                    onPress={handleCareerCertificate}
                                    type="primary"
                                    style={styles.modalButtonHalf}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>

            {/* 로딩 인디케이터 */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff"/>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    section: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    viewAllLink: {
        fontSize: 14,
        color: '#007bff',
    },
    profileSection: {
        backgroundColor: '#ffffff',
        paddingVertical: 20,
        paddingHorizontal: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImageContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: 70,
        height: 70,
    },
    profileDetails: {
        marginLeft: 15,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    editProfileButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    editProfileText: {
        fontSize: 12,
        color: '#333',
    },
    storeListContainer: {
        paddingVertical: 5,
    },
    storeCard: {
        width: 200,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    selectedStoreCard: {
        borderColor: '#007bff',
        borderWidth: 2,
    },
    storeLogoContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    storeLogo: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    storeLogoPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    storeLogoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    storeInfo: {
        flex: 1,
    },
    storeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    storeAddress: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    storeWage: {
        fontSize: 12,
        color: '#007bff',
        fontWeight: 'bold',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedIndicatorText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    attendanceActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginTop: 15,
    },
    attendanceButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    locationSettingsButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        marginHorizontal: 15,
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    locationSettingsText: {
        fontSize: 14,
        color: '#495057',
    },
    locationSettingsIcon: {
        fontSize: 16,
    },
    monthSelector: {
        marginTop: 15,
    },
    monthOptionsContainer: {
        paddingHorizontal: 15,
    },
    monthOption: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    selectedMonthOption: {
        backgroundColor: '#007bff',
    },
    monthOptionText: {
        fontSize: 14,
        color: '#333',
    },
    selectedMonthOptionText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#e9ecef',
    },
    attendanceListContainer: {
        marginTop: 10,
    },
    attendanceItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    attendanceDate: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    attendanceDateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    attendanceStatus: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    attendanceStatusText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    attendanceTimes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    attendanceTime: {
        flex: 1,
        alignItems: 'center',
    },
    attendanceTimeLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 3,
    },
    attendanceTimeValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    attendanceTimeSeparator: {
        width: 1,
        height: 30,
        backgroundColor: '#e9ecef',
        marginHorizontal: 10,
    },
    attendanceHours: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    attendanceHoursLabel: {
        fontSize: 14,
        color: '#666',
    },
    attendanceHoursValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    payrollListContainer: {
        marginTop: 10,
    },
    payrollItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    payrollHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    payrollMonth: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    payrollStatus: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    payrollStatusText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    payrollStore: {
        marginBottom: 10,
    },
    payrollStoreName: {
        fontSize: 14,
        color: '#666',
    },
    payrollDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    payrollDetail: {
        flex: 1,
    },
    payrollDetailLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 3,
    },
    payrollDetailValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    payrollDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    payrollActions: {
        alignItems: 'flex-end',
    },
    viewDetailsText: {
        fontSize: 14,
        color: '#007bff',
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        width: 350,
        height: 220,
    },
    shiftPreferenceContainer: {
        marginTop: 10,
    },
    shiftPreferenceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    shiftPreferenceItemSelected: {
        backgroundColor: '#e6f3ff',
    },
    shiftPreferenceDay: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        width: 60,
    },
    shiftPreferenceTime: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        textAlign: 'center',
    },
    shiftPreferenceStatus: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    shiftPreferenceStatusSelected: {
        backgroundColor: '#007bff',
    },
    shiftPreferenceStatusText: {
        fontSize: 12,
        color: '#666',
    },
    shiftPreferenceStatusTextSelected: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    timeOffListContainer: {
        marginTop: 10,
    },
    timeOffItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    timeOffHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    timeOffPeriod: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    timeOffStatus: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    timeOffStatusText: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    timeOffStore: {
        marginBottom: 10,
    },
    timeOffStoreName: {
        fontSize: 14,
        color: '#666',
    },
    timeOffReason: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeOffReasonLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 5,
    },
    timeOffReasonText: {
        fontSize: 14,
        color: '#333',
    },
    certificateInfo: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    certificateInfoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    certificateList: {
        marginTop: 10,
    },
    certificateItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    certificateStoreName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    certificatePeriod: {
        fontSize: 14,
        color: '#666',
    },
    emptyListText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginVertical: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        overflow: 'hidden',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalCloseButton: {
        fontSize: 20,
        color: '#666',
    },
    modalBody: {
        padding: 15,
        maxHeight: '70%',
    },
    modalFooter: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
    },
    modalButtonHalf: {
        flex: 0.48,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
    },
    settingValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    toggleButton: {
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        padding: 2,
    },
    toggleButtonActive: {
        backgroundColor: '#007bff',
    },
    toggleThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#ffffff',
    },
    toggleThumbActive: {
        transform: [{translateX: 20}],
    },
    radiusSliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    radiusValue: {
        fontSize: 14,
        color: '#666',
        width: 40,
    },
    radiusSlider: {
        flex: 1,
        height: 30,
        justifyContent: 'center',
        position: 'relative',
    },
    radiusSliderTrack: {
        height: 4,
        backgroundColor: '#e9ecef',
        borderRadius: 2,
    },
    radiusSliderFill: {
        height: 4,
        backgroundColor: '#007bff',
        borderRadius: 2,
    },
    radiusSliderThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#007bff',
        top: 5,
        marginLeft: -10,
    },
    taxInfoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    taxInfoItem: {
        marginBottom: 15,
    },
    taxInfoName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    taxInfoDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    taxInfoNote: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 15,
    },
    shiftPreferenceDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 20,
    },
    shiftPreferenceList: {
        marginBottom: 15,
    },
    shiftPreferenceModalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    shiftPreferenceModalDay: {
        width: 60,
    },
    shiftPreferenceModalDayText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    shiftPreferenceModalTime: {
        flex: 1,
    },
    shiftPreferenceModalTimeText: {
        fontSize: 14,
        color: '#666',
    },
    shiftPreferenceModalToggle: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
    },
    shiftPreferenceModalToggleSelected: {
        backgroundColor: '#007bff',
    },
    shiftPreferenceModalToggleText: {
        fontSize: 12,
        color: '#666',
    },
    shiftPreferenceModalToggleTextSelected: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    timeOffDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    certificateModalDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default EmployeeMyPageScreen;
