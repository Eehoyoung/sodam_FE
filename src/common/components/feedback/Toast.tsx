import React, {useCallback, useEffect, useRef} from 'react';
import {Platform, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle,} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    interpolate,
} from 'react-native-reanimated';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Interface for the show method parameters
interface ToastShowParams {
    type?: ToastType;
    text1?: string;
    text2?: string;
    duration?: number;
    position?: 'top' | 'bottom';
    style?: ViewStyle;
    textStyle?: TextStyle;
    showCloseButton?: boolean;
}

// Interface for the component props
interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    duration?: number;
    onClose?: () => void;
    position?: 'top' | 'bottom';
    style?: ViewStyle;
    textStyle?: TextStyle;
    showCloseButton?: boolean;
}

// Interface for the Toast component with static show method
interface ToastComponent extends React.FC<ToastProps> {
    show: (params: ToastShowParams) => void;
}

const Toast: ToastComponent = ({
                                         visible,
                                         message,
                                         type = 'info',
                                         duration = 3000,
                                         onClose,
                                         position = 'bottom',
                                         style,
                                         textStyle,
                                         showCloseButton = true,
                                     }) => {
    const fadeAnim = useSharedValue(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Animated style using Reanimated 3
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        transform: [
            {
                translateY: interpolate(
                    fadeAnim.value,
                    [0, 1],
                    [position === 'top' ? -20 : 20, 0]
                ),
            },
        ],
    }));

    const handleClose = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // 페이드 아웃 애니메이션 실행 후 onClose 콜백 호출
        fadeAnim.value = withTiming(0, { duration: 300 }, (finished) => {
            'worklet';
            if (finished && onClose) {
                runOnJS(onClose)();
            }
        });
    }, [fadeAnim, onClose]);

    useEffect(() => {
        if (visible) {
            // 토스트가 보이면 페이드 인 애니메이션 실행
            fadeAnim.value = withTiming(1, { duration: 300 });

            // 지정된 시간 후에 토스트 닫기
            if (duration > 0) {
                timeoutRef.current = setTimeout(() => {
                    handleClose();
                }, duration);
            }
        } else {
            // 토스트가 사라지면 페이드 아웃 애니메이션 실행
            fadeAnim.value = withTiming(0, { duration: 300 });
        }

        // 컴포넌트 언마운트 시 타이머 정리
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [visible, duration, fadeAnim, handleClose]);

    // 토스트 타입에 따른 배경색 설정
    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#2ecc71';
            case 'error':
                return '#e74c3c';
            case 'warning':
                return '#f39c12';
            case 'info':
            default:
                return '#3498db';
        }
    };

    // 토스트가 보이지 않으면 렌더링하지 않음
    if (!visible && fadeAnim.value === 0) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                position === 'top' ? styles.topPosition : styles.bottomPosition,
                {
                    backgroundColor: getBackgroundColor(),
                },
                animatedStyle,
                style,
            ]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite">
            <Text style={[styles.message, textStyle]}>{message}</Text>
            {showCloseButton && (
                <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeButton}
                    accessibilityRole="button"
                    accessibilityLabel="닫기"
                    accessibilityHint="알림을 닫습니다">
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 6,
            },
        }),
        zIndex: 9999,
    },
    topPosition: {
        top: Platform.OS === 'ios' ? 50 : 20,
    },
    bottomPosition: {
        bottom: 20,
    },
    message: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    closeButton: {
        marginLeft: 8,
        padding: 4,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

// Add static show method to Toast component
Toast.show = (params: ToastShowParams) => {
    // This is a simple implementation that logs the toast message
    // In a real implementation, this would manage a global toast state
    console.log(`Toast: ${params.text1} - ${params.text2}`);

    // You would typically use a state management solution or a ref to manage toast visibility
    // For now, we're just logging the message
};

export default Toast as ToastComponent;
