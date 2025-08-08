import React from 'react';
import {StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native';

// 카드 컴포넌트의 Props 타입 정의
interface CardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    contentStyle?: ViewStyle;
    elevation?: number;
    bordered?: boolean;
    footer?: React.ReactNode;
}

/**
 * 재사용 가능한 카드 컴포넌트
 *
 * 제목, 부제목, 내용, 푸터 등을 포함할 수 있는 카드 컴포넌트입니다.
 * 터치 가능한 카드와 일반 카드를 모두 지원합니다.
 */
const Card: React.FC<CardProps> = ({
                                       title,
                                       subtitle,
                                       children,
                                       onPress,
                                       style,
                                       titleStyle,
                                       subtitleStyle,
                                       contentStyle,
                                       elevation = 2,
                                       bordered = false,
                                       footer,
                                   }) => {
    // 카드 컨테이너 렌더링
    const renderCardContainer = () => {
        const cardContent = (
            <>
                {/* 제목과 부제목이 있는 경우 헤더 렌더링 */}
                {(title || subtitle) && (
                    <View style={styles.header}>
                        {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
                        {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
                    </View>
                )}

                {/* 카드 내용 */}
                <View style={[styles.content, contentStyle]}>{children}</View>

                {/* 푸터가 있는 경우 렌더링 */}
                {footer && <View style={styles.footer}>{footer}</View>}
            </>
        );

        // 카드 스타일 계산
        const cardStyle = [
            styles.card,
            {
                elevation,
                shadowOpacity: elevation * 0.05,
                shadowRadius: elevation,
            },
            bordered && styles.bordered,
            style,
        ];

        // 터치 가능한 카드인 경우
        if (onPress) {
            return (
                <TouchableOpacity
                    style={cardStyle}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    {cardContent}
                </TouchableOpacity>
            );
        }

        // 일반 카드인 경우
        return <View style={cardStyle}>{cardContent}</View>;
    };

    return renderCardContainer();
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 2},
        marginVertical: 8,
        marginHorizontal: 0,
        overflow: 'hidden',
    },
    bordered: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    content: {
        padding: 16,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
});

export default Card;
