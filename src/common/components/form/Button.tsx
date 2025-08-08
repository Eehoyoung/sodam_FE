import React from 'react';
import {ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle} from 'react-native';

// 버튼 컴포넌트의 Props 타입 정의
interface ButtonProps {
    title: string;
    onPress: () => void;
    type?: 'primary' | 'secondary' | 'outline' | 'text';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

/**
 * 재사용 가능한 버튼 컴포넌트
 *
 * 다양한 스타일과 크기를 지원하며, 로딩 상태와 비활성화 상태를 표시할 수 있습니다.
 */
const Button: React.FC<ButtonProps> = ({
                                           title,
                                           onPress,
                                           type = 'primary',
                                           size = 'medium',
                                           disabled = false,
                                           loading = false,
                                           fullWidth = false,
                                           style,
                                           textStyle,
                                           icon,
                                       }) => {
    // 버튼 타입에 따른 스타일 결정
    const getButtonStyle = () => {
        switch (type) {
            case 'primary':
                return styles.primaryButton;
            case 'secondary':
                return styles.secondaryButton;
            case 'outline':
                return styles.outlineButton;
            case 'text':
                return styles.textButton;
            default:
                return styles.primaryButton;
        }
    };

    // 버튼 크기에 따른 스타일 결정
    const getButtonSizeStyle = () => {
        switch (size) {
            case 'small':
                return styles.smallButton;
            case 'medium':
                return styles.mediumButton;
            case 'large':
                return styles.largeButton;
            default:
                return styles.mediumButton;
        }
    };

    // 텍스트 타입에 따른 스타일 결정
    const getTextStyle = () => {
        switch (type) {
            case 'primary':
                return styles.primaryText;
            case 'secondary':
                return styles.secondaryText;
            case 'outline':
                return styles.outlineText;
            case 'text':
                return styles.textButtonText;
            default:
                return styles.primaryText;
        }
    };

    // 텍스트 크기에 따른 스타일 결정
    const getTextSizeStyle = () => {
        switch (size) {
            case 'small':
                return styles.smallText;
            case 'medium':
                return styles.mediumText;
            case 'large':
                return styles.largeText;
            default:
                return styles.mediumText;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyle(),
                getButtonSizeStyle(),
                disabled && styles.disabledButton,
                fullWidth && styles.fullWidthButton,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={type === 'outline' || type === 'text' ? '#007AFF' : '#FFFFFF'}/>
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <Text
                        style={[
                            styles.text,
                            getTextStyle(),
                            getTextSizeStyle(),
                            disabled && styles.disabledText,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    secondaryButton: {
        backgroundColor: '#5856D6',
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    textButton: {
        backgroundColor: 'transparent',
    },
    smallButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    mediumButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    largeButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    disabledButton: {
        backgroundColor: '#E5E5EA',
        borderColor: '#E5E5EA',
    },
    fullWidthButton: {
        width: '100%',
    },
    text: {
        fontWeight: '600',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#FFFFFF',
    },
    outlineText: {
        color: '#007AFF',
    },
    textButtonText: {
        color: '#007AFF',
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },
    disabledText: {
        color: '#8E8E93',
    },
});

export default Button;
