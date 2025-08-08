import React from 'react';
import {StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native';

interface BadgeProps {
    text: string;
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
                                         text,
                                         type = 'primary',
                                         size = 'medium',
                                         style,
                                         textStyle,
                                     }) => {
    const getBadgeStyle = () => {
        let baseStyle: ViewStyle = {};

        // 타입에 따른 스타일
        switch (type) {
            case 'primary':
                baseStyle = {
                    backgroundColor: '#3498db',
                };
                break;
            case 'success':
                baseStyle = {
                    backgroundColor: '#2ecc71',
                };
                break;
            case 'warning':
                baseStyle = {
                    backgroundColor: '#f39c12',
                };
                break;
            case 'danger':
                baseStyle = {
                    backgroundColor: '#e74c3c',
                };
                break;
            case 'info':
                baseStyle = {
                    backgroundColor: '#95a5a6',
                };
                break;
        }

        // 크기에 따른 스타일
        switch (size) {
            case 'small':
                baseStyle = {
                    ...baseStyle,
                    paddingVertical: 2,
                    paddingHorizontal: 6,
                };
                break;
            case 'medium':
                baseStyle = {
                    ...baseStyle,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                };
                break;
            case 'large':
                baseStyle = {
                    ...baseStyle,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                };
                break;
        }

        return baseStyle;
    };

    const getTextStyle = () => {
        let baseStyle: TextStyle = {
            color: '#fff',
            fontWeight: '500',
        };

        // 크기에 따른 텍스트 스타일
        switch (size) {
            case 'small':
                baseStyle.fontSize = 10;
                break;
            case 'medium':
                baseStyle.fontSize = 12;
                break;
            case 'large':
                baseStyle.fontSize = 14;
                break;
        }

        return baseStyle;
    };

    return (
        <View
            style={[styles.badge, getBadgeStyle(), style]}
            accessibilityRole="text"
            accessibilityLabel={text}>
            <Text style={[getTextStyle(), textStyle]}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        borderRadius: 100,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Badge;
