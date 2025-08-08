import React, {useState, useMemo} from 'react';
import {Dimensions, Platform, ScrollView, StyleSheet, View} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate,
    Extrapolate,
    runOnJS,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {RootNavigationProp} from '../../../navigation/types';

// Import section components
import StorytellingSection from '../components/StorytellingSection';
import FeatureDashboardSection from '../components/FeatureDashboardSection';
import ConversionSection from '../components/ConversionSection';
import Header from '../components/Header';

interface SectionVisibility {
    problems: boolean;
    solutions: boolean;
    cta: boolean;
}

const HybridMainScreen: React.FC = () => {
    const navigation = useNavigation<RootNavigationProp>();

    // Cache screen height outside worklet to avoid JSI violation
    let screenHeight;
    try {
        screenHeight = useMemo(() => {
            const dimensions = Dimensions.get('window');
            return dimensions.height;
        }, []);
    } catch (error) {
        console.error('HybridMainScreen: Failed to get screen dimensions:', error);
        throw error;
    }

    const [currentSection, setCurrentSection] = useState(0);
    const [isVisible, setIsVisible] = useState<SectionVisibility>({
        problems: true, // 첫 섹션은 즉시 표시
        solutions: false,
        cta: false
    });

    const scrollY = useSharedValue(0);
    const progressAnim = useSharedValue(0);

    const handleScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            const offsetY = event.contentOffset.y;
            const sectionHeight = screenHeight * 0.8;
            const totalScrollHeight = sectionHeight * 3; // 3 sections total

            // Calculate progress (0 to 1)
            const progress = Math.min(Math.max(offsetY / totalScrollHeight, 0), 1);
            progressAnim.value = progress;

            // 섹션별 가시성 업데이트
            if (offsetY > sectionHeight * 0.3) {
                runOnJS(() => {
                    setIsVisible(prev => {
                        if (!prev.solutions) {
                            setCurrentSection(1);
                            return {...prev, solutions: true};
                        }
                        return prev;
                    });
                })();
            }
            if (offsetY > sectionHeight * 1.2) {
                runOnJS(() => {
                    setIsVisible(prev => {
                        if (!prev.cta) {
                            setCurrentSection(2);
                            return {...prev, cta: true};
                        }
                        return prev;
                    });
                })();
            }
        },
    });

    const handleFeatureTest = (featureId: string) => {
        // TODO: 기능별 데모 구현
    };

    const handleAppDownload = () => {
        // TODO: 앱 스토어 링크 연결
    };

    const handleWebTrial = () => {
        navigation.navigate('Auth', {screen: 'Signup'});
    };

    const handleLogin = () => {
        navigation.navigate('Auth', {screen: 'Login'});
    };

    const handleSignup = () => {
        navigation.navigate('Auth', {screen: 'Signup'});
    };

    // Progress bar animated style
    const progressBarStyle = useAnimatedStyle(() => ({
        width: `${progressAnim.value * 100}%`,
    }));

    // Progress dots animated styles
    const getProgressDotStyle = (index: number) => {
        return useAnimatedStyle(() => {
            const startProgress = index / 3;
            const endProgress = (index + 1) / 3;

            const backgroundColor = interpolate(
                progressAnim.value,
                [startProgress, endProgress],
                [0, 1],
                Extrapolate.CLAMP
            ) > 0.5 ? '#2196F3' : '#E0E0E0';

            const scale = interpolate(
                progressAnim.value,
                [startProgress, endProgress],
                [1, 1.2],
                Extrapolate.CLAMP
            );

            return {
                backgroundColor,
                transform: [{ scale }],
            };
        });
    };

    return (
        <View style={styles.container}>
            <Header onLogin={handleLogin} onSignup={handleSignup}/>

            {/* Scroll Progress Indicator */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <Animated.View
                        style={[styles.progressBar, progressBarStyle]}
                    />
                </View>
                <View style={styles.progressDots}>
                    {[0, 1, 2].map((index) => (
                        <Animated.View
                            key={index}
                            style={[styles.progressDot, getProgressDotStyle(index)]}
                        />
                    ))}
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Section 1: 스토리텔링 영역 */}
                <StorytellingSection
                    isVisible={isVisible.problems}
                    onComplete={() => setCurrentSection(1)}
                />

                {/* Section 2: 기능 대시보드 영역 */}
                <FeatureDashboardSection
                    isVisible={isVisible.solutions}
                    onFeatureTest={handleFeatureTest}
                />

                {/* Section 3: 체험 및 전환 영역 */}
                <ConversionSection
                    isVisible={isVisible.cta}
                    onDownload={handleAppDownload}
                    onWebTrial={handleWebTrial}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    progressContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 100 : 80,
        right: 20,
        zIndex: 1000,
        alignItems: 'center',
    },
    progressTrack: {
        width: 4,
        height: 120,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#2196F3',
        borderRadius: 2,
    },
    progressDots: {
        alignItems: 'center',
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginVertical: 8,
        backgroundColor: '#E0E0E0',
    },
});

export default HybridMainScreen;
