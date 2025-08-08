import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native';

// 입력 필드 컴포넌트의 Props 타입 정의
interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    secureTextEntry?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    editable?: boolean;
    style?: ViewStyle;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    errorStyle?: TextStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onBlur?: () => void;
    onFocus?: () => void;
}

/**
 * 재사용 가능한 입력 필드 컴포넌트
 *
 * 라벨, 에러 메시지, 아이콘 등을 지원하며 다양한 입력 타입을 처리할 수 있습니다.
 */
const Input: React.FC<InputProps> = ({
                                         value,
                                         onChangeText,
                                         placeholder,
                                         label,
                                         error,
                                         secureTextEntry = false,
                                         multiline = false,
                                         numberOfLines = 1,
                                         maxLength,
                                         keyboardType = 'default',
                                         autoCapitalize = 'none',
                                         editable = true,
                                         style,
                                         containerStyle,
                                         inputStyle,
                                         labelStyle,
                                         errorStyle,
                                         leftIcon,
                                         rightIcon,
                                         onBlur,
                                         onFocus,
                                     }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    // 비밀번호 표시/숨김 토글
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    // 포커스 이벤트 핸들러
    const handleFocus = () => {
        setIsFocused(true);
        if (onFocus) onFocus();
    };

    // 블러 이벤트 핸들러
    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) onBlur();
    };

    return (
        <View style={[styles.container, style || null, containerStyle || null]}>
            {label && <Text style={[styles.label, labelStyle || null]}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused ? styles.focusedInput : null,
                    error ? styles.errorInput : null,
                    !editable ? styles.disabledInput : null,
                ]}
            >
                {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        multiline ? styles.multilineInput : null,
                        leftIcon ? styles.inputWithLeftIcon : null,
                        rightIcon ? styles.inputWithRightIcon : null,
                        inputStyle || null,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#8E8E93"
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : undefined}
                    maxLength={maxLength}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        style={styles.rightIconContainer}
                        onPress={togglePasswordVisibility}
                    >
                        <Text style={styles.passwordToggle}>
                            {isPasswordVisible ? '숨기기' : '보기'}
                        </Text>
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <View style={styles.rightIconContainer}>{rightIcon}</View>
                )}
            </View>

            {error && <Text style={[styles.errorText, errorStyle || null]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#000000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#C7C7CC',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    input: {
        flex: 1,
        height: 48,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000000',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    inputWithLeftIcon: {
        paddingLeft: 8,
    },
    inputWithRightIcon: {
        paddingRight: 8,
    },
    leftIconContainer: {
        paddingLeft: 16,
    },
    rightIconContainer: {
        paddingRight: 16,
    },
    focusedInput: {
        borderColor: '#007AFF',
    },
    errorInput: {
        borderColor: '#FF3B30',
    },
    disabledInput: {
        backgroundColor: '#F2F2F7',
        borderColor: '#E5E5EA',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginTop: 4,
    },
    passwordToggle: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default Input;
