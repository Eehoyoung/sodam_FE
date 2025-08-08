import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withRepeat,
    withSequence,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import { useJSISafeDimensions } from '../../../../hooks/useJSISafeDimensions';
import {
    CombinedAnimation,
    ProgressAnimation,
    PulseAnimation
} from '../../../../common/components/animations';

interface DemoResult {
    success: boolean;
    message: string;
    timestamp: number;
}

interface QRCodeDemoProps {
    onDemoComplete: (result: DemoResult) => void;
    isVisible: boolean;
}

const QRCodeDemo: React.FC<QRCodeDemoProps> = ({onDemoComplete, isVisible}) => {
    const [demoStep, setDemoStep] = useState<'idle' | 'scanning' | 'success' | 'complete'>('idle');
    const [scanProgress, setScanProgress] = useState(0);

    // Use JSI-safe dimensions hook
    let dimensions;
    try {
        const hookResult = useJSISafeDimensions();
        dimensions = hookResult.dimensions;
    } catch (error) {
        console.error('QRCodeDemo: Failed to get dimensions:', error);
        throw error;
    }

    // Animation logic is now handled by standardized animation components

    useEffect(() => {
        if (demoStep === 'scanning') {
            // 진행률 업데이트
            const progressInterval = setInterval(() => {
                setScanProgress(prev => {
                    const newProgress = prev + 5;
                    if (newProgress >= 100) {
                        clearInterval(progressInterval);
                        setDemoStep('success');
                        setTimeout(() => {
                            setDemoStep('complete');
                            onDemoComplete({
                                success: true,
                                message: 'QR 출퇴근 체험이 완료되었습니다!',
                                timestamp: Date.now()
                            });
                        }, 1500);
                        return 100;
                    }
                    return newProgress;
                });
            }, 100);

            return () => {
                clearInterval(progressInterval);
            };
        }
    }, [demoStep, onDemoComplete]);

    const startDemo = () => {
        setDemoStep('scanning');
        setScanProgress(0);
    };

    const closeDemo = () => {
        onDemoComplete({
            success: false,
            message: '데모가 취소되었습니다.',
            timestamp: Date.now()
        });
    };

    // Animation styles are now handled by standardized animation components

    const renderQRScanner = () => (
        <PulseAnimation
            isActive={demoStep === 'scanning'}
            style={styles.qrScanner}
            config={{ minScale: 1, maxScale: 1.1, duration: 500 }}
        >
            <View style={styles.qrFrame}>
                <View style={styles.qrCorner}/>
                <View style={[styles.qrCorner, styles.qrCornerTopRight]}/>
                <View style={[styles.qrCorner, styles.qrCornerBottomLeft]}/>
                <View style={[styles.qrCorner, styles.qrCornerBottomRight]}/>

                {demoStep === 'scanning' && (
                    <View style={styles.scanLine} />
                )}

                {demoStep === 'success' && (
                    <View style={styles.successIcon}>
                        <Text style={styles.successText}>✓</Text>
                    </View>
                )}
            </View>
        </PulseAnimation>
    );

    const renderDemoContent = () => {
        switch (demoStep) {
            case 'idle':
                return (
                    <View style={styles.demoContent}>
                        <Text style={styles.demoTitle}>QR 출퇴근 체험하기</Text>
                        <Text style={styles.demoDescription}>
                            실제 QR 코드 스캔 과정을 체험해보세요.{'\n'}
                            1초만에 출퇴근이 완료됩니다!
                        </Text>
                        <TouchableOpacity style={styles.startButton} onPress={startDemo}>
                            <Text style={styles.startButtonText}>📱 스캔 시작하기</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'scanning':
                return (
                    <View style={styles.demoContent}>
                        <Text style={styles.demoTitle}>QR 코드 스캔 중...</Text>
                        <Text style={styles.progressText}>{scanProgress}%</Text>
                        <View style={styles.progressBar}>
                            <ProgressAnimation
                                progress={scanProgress / 100}
                                config={{ duration: 100, easing: Easing.linear }}
                                style={styles.progressFill}
                            >
                                <View />
                            </ProgressAnimation>
                        </View>
                        <Text style={styles.scanningText}>
                            📍 위치 확인 중...{'\n'}
                            ⏰ 출근 시간 기록 중...
                        </Text>
                    </View>
                );

            case 'success':
                return (
                    <View style={styles.demoContent}>
                        <Text style={styles.successTitle}>✅ 출근 완료!</Text>
                        <View style={styles.resultCard}>
                            <Text style={styles.resultText}>📅 2025년 1월 13일</Text>
                            <Text style={styles.resultText}>⏰ 오전 9:00 출근</Text>
                            <Text style={styles.resultText}>📍 강남구 카페 본점</Text>
                            <Text style={styles.resultText}>✨ 정상 출근 처리됨</Text>
                        </View>
                    </View>
                );

            case 'complete':
                return (
                    <View style={styles.demoContent}>
                        <Text style={styles.completeTitle}>🎉 체험 완료!</Text>
                        <Text style={styles.completeDescription}>
                            실제 앱에서는 더 많은 기능을 사용할 수 있습니다:
                        </Text>
                        <View style={styles.featureList}>
                            <Text style={styles.featureItem}>• GPS 위치 자동 확인</Text>
                            <Text style={styles.featureItem}>• 실시간 알림 발송</Text>
                            <Text style={styles.featureItem}>• 근무 시간 자동 계산</Text>
                            <Text style={styles.featureItem}>• 월별 출근 통계</Text>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    if (!isVisible) return null;

    return (
        <CombinedAnimation
            isVisible={isVisible}
            fadeConfig={{ duration: 300, easing: Easing.out(Easing.cubic) }}
            scaleConfig={{ damping: 15, stiffness: 150 }}
            style={styles.overlay}
        >
            <View style={styles.demoModal}>
                <TouchableOpacity style={styles.closeButton} onPress={closeDemo}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                {renderQRScanner()}
                {renderDemoContent()}
            </View>
        </CombinedAnimation>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    demoModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#666666',
        fontWeight: 'bold',
    },
    qrScanner: {
        marginBottom: 24,
    },
    qrFrame: {
        width: 200,
        height: 200,
        borderRadius: 12,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    qrCorner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#2196F3',
        borderWidth: 3,
        top: 8,
        left: 8,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    qrCornerTopRight: {
        top: 8,
        right: 8,
        left: 'auto',
        borderLeftWidth: 0,
        borderRightWidth: 3,
        borderBottomWidth: 0,
    },
    qrCornerBottomLeft: {
        bottom: 8,
        left: 8,
        top: 'auto',
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomWidth: 3,
    },
    qrCornerBottomRight: {
        bottom: 8,
        right: 8,
        top: 'auto',
        left: 'auto',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderRightWidth: 3,
        borderBottomWidth: 3,
    },
    scanLine: {
        position: 'absolute',
        width: '80%',
        height: 2,
        backgroundColor: '#FF4081',
        shadowColor: '#FF4081',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    successIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successText: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    demoContent: {
        alignItems: 'center',
        width: '100%',
    },
    demoTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 12,
        textAlign: 'center',
    },
    demoDescription: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    startButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        shadowColor: '#2196F3',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    progressText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2196F3',
        marginBottom: 16,
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#2196F3',
        borderRadius: 4,
    },
    scanningText: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#4CAF50',
        marginBottom: 20,
        textAlign: 'center',
    },
    resultCard: {
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 16,
        width: '100%',
    },
    resultText: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 8,
        textAlign: 'center',
    },
    completeTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FF4081',
        marginBottom: 16,
        textAlign: 'center',
    },
    completeDescription: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    featureList: {
        alignItems: 'flex-start',
        width: '100%',
    },
    featureItem: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 8,
        lineHeight: 20,
    },
});

export default QRCodeDemo;
