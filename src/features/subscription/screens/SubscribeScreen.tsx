import React, {useState} from 'react';
import {
    Alert,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import MainLayout from '../../../common/components/layout/MainLayout';
import {Button} from '../../../common/components';

// 네비게이션 타입 정의
type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Subscribe: undefined;
};

type SubscribeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// 구독 플랜 타입 정의
type PlanType = '구독' | '수수료' | '월정액' | '무료';

// 플랜 아이템 인터페이스
interface PlanFeature {
    text: string;
    included: boolean;
}

// 각 플랜의 데이터 인터페이스
interface PlanData {
    id: string;
    type: PlanType;
    title: string;
    price: string;
    description: string;
    color: string;
    features: PlanFeature[];
    recommended?: boolean;
    badge?: string;
}

/**
 * 구독 플랜 선택 화면
 * 사용자가 다양한 구독 플랜을 비교하고 선택할 수 있는 화면
 */
const SubscribeScreen = () => {
    const navigation = useNavigation<SubscribeScreenNavigationProp>();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // 플랜 데이터 정의
    const plans: PlanData[] = [
        {
            id: 'business',
            type: '구독',
            title: '비즈니스',
            price: '월 15,000원',
            description: '사업주를 위한 종합 서비스 패키지',
            color: '#3498db',
            badge: '인기',
            recommended: true,
            features: [
                {text: '근태 기록 및 급여 산출 기능', included: true},
                {text: '세무 신고 자동 연계 서비스', included: true},
                {text: '급여 명세서 발급', included: true},
                {text: '사용자 맞춤형 대시보드', included: true},
                {text: '전화 및 채팅 고객 지원', included: true},
                {text: '종합소득세 신고 대행', included: false},
                {text: '세무사와의 직접 상담', included: false},
            ],
        },
        {
            id: 'commission',
            type: '수수료',
            title: '환급형',
            price: '환급금의 10~20%',
            description: '세금 환급에 따른 수수료만 지불',
            color: '#2ecc71',
            features: [
                {text: '근태 기록 및 급여 산출 기능', included: false},
                {text: '세무 신고 자동 연계 서비스', included: false},
                {text: '급여 명세서 발급', included: false},
                {text: '사용자 맞춤형 대시보드', included: false},
                {text: '전화 및 채팅 고객 지원', included: false},
                {text: '종합소득세 신고 대행', included: true},
                {text: '필요 서류 발급 및 관리', included: true},
                {text: '세무사와의 상담 서비스', included: true},
            ],
        },
        {
            id: 'premium',
            type: '월정액',
            title: '프리미엄',
            price: '월 50,000원',
            description: '최고급 세무 서비스 (사업주 전용)',
            color: '#9b59b6',
            badge: '프리미엄',
            features: [
                {text: '근태 기록 및 급여 산출 기능', included: true},
                {text: '세무 신고 자동 연계 서비스', included: true},
                {text: '급여 명세서 발급', included: true},
                {text: '사용자 맞춤형 대시보드', included: true},
                {text: '전화 및 채팅 고객 지원', included: true},
                {text: '종합소득세 신고 대행', included: true},
                {text: '필요 서류 발급 및 관리', included: true},
                {text: '세무사와의 직접 상담 서비스', included: true},
                {text: '추가 세무 상담 (연 1회 무료)', included: true},
            ],
        },
        {
            id: 'free',
            type: '무료',
            title: '기본',
            price: '무료',
            description: '기본 기능만 필요한 사용자를 위한 서비스',
            color: '#95a5a6',
            features: [
                {text: '기본 근태 기록 및 급여 산출', included: true},
                {text: 'FAQ 및 이메일 고객 지원', included: true},
                {text: '세무 신고 연계 서비스', included: false},
                {text: '급여 명세서 발급', included: false},
                {text: '사용자 맞춤형 대시보드', included: false},
                {text: '전화 및 채팅 고객 지원', included: false},
                {text: '광고 노출', included: true},
            ],
        },
    ];

    // 구독 처리 함수
    const handleSubscribe = () => {
        if (!selectedPlan) {
            Alert.alert('알림', '구독 플랜을 선택해주세요.');
            return;
        }

        setIsProcessing(true);

        // 실제 구현에서는 API 호출 필요
        setTimeout(() => {
            setIsProcessing(false);

            const planName = plans.find(p => p.id === selectedPlan)?.title || '';

            Alert.alert(
                '구독 신청 완료',
                `${planName} 플랜 구독이 신청되었습니다.`,
                [{text: '확인', onPress: () => navigation.navigate('Home')}]
            );
        }, 1500);
    };

    // 플랜 아이템 렌더링 함수
    const renderPlanCard = (plan: PlanData) => {
        const isSelected = selectedPlan === plan.id;

        return (
            <TouchableOpacity
                key={plan.id}
                style={[
                    styles.planCard,
                    {borderColor: plan.color},
                    isSelected && {
                        shadowColor: plan.color,
                        shadowOffset: {width: 0, height: 0},
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                        elevation: 8,
                        transform: [{scale: 1.02}],
                    },
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.9}
            >
                {plan.badge && (
                    <View style={[styles.badge, {backgroundColor: plan.color}]}>
                        <Text style={styles.badgeText}>{plan.badge}</Text>
                    </View>
                )}

                <View style={styles.planHeader}>
                    <View style={styles.planTitleContainer}>
                        <Text style={styles.planType}>{plan.type} 모델</Text>
                        <Text style={[styles.planTitle, {color: plan.color}]}>{plan.title}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{plan.price}</Text>
                    </View>
                </View>

                <Text style={styles.planDescription}>{plan.description}</Text>

                <View style={styles.divider}/>

                <View style={styles.featuresContainer}>
                    {plan.features.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={[
                                styles.featureIcon,
                                {backgroundColor: feature.included ? plan.color : '#eee'},
                            ]}>
                                <Text style={styles.featureIconText}>
                                    {feature.included ? '✓' : '×'}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.featureText,
                                    !feature.included && styles.featureTextDisabled,
                                ]}
                            >
                                {feature.text}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.selectButtonContainer}>
                    <Button
                        title={isSelected ? '선택됨' : '선택하기'}
                        onPress={() => setSelectedPlan(plan.id)}
                        type={isSelected ? 'primary' : 'outline'}
                        fullWidth
                        style={{
                            backgroundColor: isSelected ? plan.color : 'transparent',
                            borderColor: plan.color,
                        }}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <MainLayout>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.headerContainer}>
                        <ImageBackground
                            // source={require('../../../assets/images/subscribe_bg.jpg')} // 실제 프로젝트에 맞는 이미지로 교체 필요
                            style={styles.headerBg}
                            resizeMode="cover"
                        >
                            <View style={styles.headerOverlay}>
                                <Text style={styles.headerTitle}>소담 프리미엄 서비스</Text>
                                <Text style={styles.headerSubtitle}>
                                    소상공인을 위한 최적의 플랜을 선택하세요
                                </Text>
                            </View>
                        </ImageBackground>
                    </View>

                    <View style={styles.container}>
                        <Text style={styles.sectionTitle}>구독 플랜</Text>
                        <Text style={styles.sectionSubtitle}>
                            소담은 여러분의 비즈니스 규모와 요구사항에 맞게 다양한 구독 플랜을 제공합니다.
                        </Text>

                        <View style={styles.planComparisonContainer}>
                            {plans.map(renderPlanCard)}
                        </View>

                        <View style={styles.subscribeButtonContainer}>
                            <Button
                                title="선택한 플랜 구독하기"
                                onPress={handleSubscribe}
                                loading={isProcessing}
                                disabled={!selectedPlan || isProcessing}
                                fullWidth
                                size="large"
                                style={styles.subscribeButton}
                            />
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.infoTitle}>구독 시 유의사항</Text>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoText}>• 구독은 결제일로부터 30일간 유효하며, 자동 갱신됩니다.</Text>
                                <Text style={styles.infoText}>• 구독 취소는 언제든지 가능하며, 남은 기간 동안은 서비스가 유지됩니다.</Text>
                                <Text style={styles.infoText}>• 결제 관련 문의는 고객센터(1544-0000)로 연락해주세요.</Text>
                            </View>

                            <TouchableOpacity style={styles.termsButton}
                                              onPress={() => Alert.alert('이용약관', '구독 서비스 이용약관 내용입니다.')}>
                                <Text style={styles.termsButtonText}>이용약관 보기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </MainLayout>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerContainer: {
        width: '100%',
        height: 200,
    },
    headerBg: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        marginTop: 20,
        textAlign: 'center',
    },
    sectionSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    planComparisonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'stretch',
        marginBottom: 30,
    },
    planCard: {
        width: '95%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    badge: {
        position: 'absolute',
        top: 15,
        right: -30,
        backgroundColor: '#3498db',
        paddingVertical: 5,
        paddingHorizontal: 30,
        transform: [{rotate: '45deg'}],
        zIndex: 1,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    planTitleContainer: {
        flex: 1,
    },
    planType: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
    },
    planTitle: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    planDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 15,
        width: '100%',
    },
    featuresContainer: {
        marginBottom: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureIcon: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    featureIconText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    featureText: {
        flex: 1,
        fontSize: 14,
        color: '#444',
    },
    featureTextDisabled: {
        color: '#aaa',
    },
    selectButtonContainer: {
        marginTop: 10,
    },
    subscribeButtonContainer: {
        marginTop: 10,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    subscribeButton: {
        height: 56,
    },
    infoContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 20,
        marginBottom: 30,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    infoItem: {
        marginBottom: 15,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    termsButton: {
        alignSelf: 'center',
        marginTop: 10,
    },
    termsButtonText: {
        color: '#3498db',
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});

export default SubscribeScreen;
