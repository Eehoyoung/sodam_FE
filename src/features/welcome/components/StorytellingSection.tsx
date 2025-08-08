import React, {useEffect, useRef} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withRepeat,
    withSequence,
    runOnJS,
    Easing,
} from 'react-native-reanimated';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface Problem {
    id: string;
    emoji: string;
    title: string;
    description: string;
    animation: 'fadeIn' | 'slideUp' | 'bounce';
}

interface StorytellingSectionProps {
    isVisible: boolean;
    onComplete?: () => void;
}

const StorytellingSection: React.FC<StorytellingSectionProps> = ({
                                                                     isVisible,
                                                                     onComplete
                                                                 }) => {
    const fadeAnim = useSharedValue(0);
    const slideAnim1 = useSharedValue(50);
    const slideAnim2 = useSharedValue(50);
    const slideAnim3 = useSharedValue(50);
    const arrowBounce = useSharedValue(0);

    const problems: Problem[] = [
        {
            id: 'attendance',
            emoji: '😰',
            title: '출퇴근 확인이 번거로워',
            description: '매번 직원들 출근시간\n확인하기가 힘들어요',
            animation: 'fadeIn'
        },
        {
            id: 'salary',
            emoji: '💸',
            title: '급여 계산이 복잡해',
            description: '시간당 계산하고 세금까지\n고려하면 너무 복잡해요',
            animation: 'slideUp'
        },
        {
            id: 'management',
            emoji: '🏪',
            title: '여러 매장 관리 어려워',
            description: '매장마다 다른 시스템으로\n관리하기가 힘들어요',
            animation: 'bounce'
        }
    ];

    useEffect(() => {
        if (isVisible) {
            // 섹션 전체 페이드인 (Reanimated 3)
            fadeAnim.value = withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.cubic),
            });

            // 문제 카드들 순차적 애니메이션 (Reanimated 3)
            slideAnim1.value = withDelay(300, withTiming(0, {
                duration: 800,
                easing: Easing.out(Easing.back(1.2)),
            }));

            slideAnim2.value = withDelay(600, withTiming(0, {
                duration: 800,
                easing: Easing.out(Easing.back(1.2)),
            }));

            slideAnim3.value = withDelay(900, withTiming(0, {
                duration: 800,
                easing: Easing.out(Easing.back(1.2)),
            }, (finished) => {
                'worklet';
                if (finished) {
                    // 모든 애니메이션 완료 후 화살표 바운스 시작
                    arrowBounce.value = withRepeat(
                        withSequence(
                            withTiming(-10, {
                                duration: 1000,
                                easing: Easing.inOut(Easing.sin),
                            }),
                            withTiming(0, {
                                duration: 1000,
                                easing: Easing.inOut(Easing.sin),
                            })
                        ),
                        -1, // infinite
                        true // reverse
                    );

                    if (onComplete) {
                        runOnJS(() => {
                            setTimeout(onComplete, 1000);
                        })();
                    }
                }
            }));
        } else {
            // 컴포넌트가 보이지 않을 때 애니메이션 리셋
            fadeAnim.value = 0;
            slideAnim1.value = 50;
            slideAnim2.value = 50;
            slideAnim3.value = 50;
            arrowBounce.value = 0;
        }
    }, [isVisible]);

    // Animated styles using Reanimated 3
    const containerStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
    }));

    const problemCard1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: slideAnim1.value }],
    }));

    const problemCard2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: slideAnim2.value }],
    }));

    const problemCard3Style = useAnimatedStyle(() => ({
        transform: [{ translateY: slideAnim3.value }],
    }));

    const arrowStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: arrowBounce.value }],
    }));


    const ProblemCard: React.FC<{ problem: Problem; index: number }> = ({problem, index}) => {
        const cardStyles = [problemCard1Style, problemCard2Style, problemCard3Style];
        return (
            <Animated.View style={[styles.problemCard, cardStyles[index]]}>
                <View style={styles.problemHeader}>
                    <Text style={styles.problemEmoji}>{problem.emoji}</Text>
                    <Text style={styles.problemTitle}>{problem.title}</Text>
                </View>
                <Text style={styles.problemDescription}>{problem.description}</Text>
            </Animated.View>
        );
    };

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>이런 고민, 혹시 있으신가요?</Text>

                <View style={styles.problemsContainer}>
                    {problems.map((problem, index) => (
                        <ProblemCard
                            key={problem.id}
                            problem={problem}
                            index={index}
                        />
                    ))}
                </View>

                <View style={styles.transitionHint}>
                    <Text style={styles.hintText}>이 모든 걱정을...</Text>
                    <Animated.View style={[styles.scrollIndicator, arrowStyle]}>
                        <Text style={styles.arrowText}>↓</Text>
                    </Animated.View>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: screenHeight * 0.9,
        backgroundColor: '#FFF8F0',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FF6B35',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 32,
    },
    problemsContainer: {
        width: '100%',
        marginBottom: 60,
    },
    problemCard: {
        backgroundColor: '#FFE5E5',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#D32F2F',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    problemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    problemEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    problemTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#D32F2F',
        flex: 1,
    },
    problemDescription: {
        fontSize: 14,
        fontWeight: '400',
        color: '#666666',
        lineHeight: 20,
        paddingLeft: 36,
    },
    transitionHint: {
        alignItems: 'center',
    },
    hintText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FF6B35',
        marginBottom: 16,
    },
    scrollIndicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default StorytellingSection;
