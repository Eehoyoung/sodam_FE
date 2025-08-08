import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Alert, Platform, Linking, TouchableOpacity} from 'react-native';
import {Camera, CameraPermissionStatus, useFrameProcessor} from 'react-native-vision-camera';
import {useScanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';
import {runAtTargetFps} from 'react-native-vision-camera/src/frame-processors/runAtTargetFps';
import {Button} from '../../../common/components';
import {Card} from '../../../common/components';
import {colors, spacing} from '../../../common/styles/theme';
import {useAuth} from '../../../contexts/AuthContext';
import {
    verifyCheckInByQR,
    verifyCheckOutByQR,
    parseQRCodeData,
    isQRCodeValid
} from '../services/qrAttendanceService';
import {Toast} from '../../../common/components';
import {Icon} from '../../../common/components/Icon';

interface QRAttendanceProps {
    onSuccess?: (isCheckIn: boolean) => void;
    onError?: (error: string) => void;
}

const QRAttendance: React.FC<QRAttendanceProps> = ({
                                                       onSuccess,
                                                       onError
                                                   }) => {
    const {user} = useAuth();
    const [hasPermission, setHasPermission] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(true); // true: 출근, false: 퇴근

    // Refs to track camera services and component mount status for proper cleanup
    const isMountedRef = useRef(true);
    const cameraRef = useRef<Camera | null>(null);

    // QR 코드 스캐너 설정
    const [scanBarcodesFunction, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
        checkInverted: true,
    });

    // Create a proper frameProcessor for the Camera component
    const frameProcessor = useFrameProcessor((frame) => {
        'worklet'
        // Run barcode scanning at 5 FPS to match the previous frameProcessorFps setting
        runAtTargetFps(5, () => {
            'worklet'
            scanBarcodesFunction(frame)
        })
    }, []);

    // Cleanup effect to properly stop camera services when component unmounts
    useEffect(() => {
        return () => {
            isMountedRef.current = false;

            // Stop camera scanning to prevent Google Play Services channel leaks
            setIsActive(false);

            // Clear camera reference
            if (cameraRef.current) {
                cameraRef.current = null;
            }
        };
    }, []);

    // 카메라 권한 요청
    const requestCameraPermission = async () => {
        if (!isMountedRef.current) {
            return;
        }

        const permission = await Camera.requestCameraPermission();

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) {
            console.log('[DEBUG_LOG] QRAttendance: Component unmounted during camera permission request, skipping state update');
            return;
        }

        setHasPermission(permission === 'granted');

        if (permission !== 'granted') {
            if (onError) onError('카메라 권한이 필요합니다.');

            // 권한이 영구적으로 거부된 경우 설정으로 이동 안내
            if (permission === 'denied') {
                Alert.alert(
                    '카메라 권한 필요',
                    '출퇴근 인증을 위해 카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
                    [
                        {text: '취소', style: 'cancel'},
                        {
                            text: '설정으로 이동',
                            onPress: () => Linking.openSettings()
                        }
                    ]
                );
            }
        }
    };

    // QR 코드 스캔 처리
    const handleQRCodeScanned = async (qrData: string) => {
        // Check if component is still mounted
        if (!isMountedRef.current) {
            console.log('[DEBUG_LOG] QRAttendance: Component unmounted, skipping QR code processing');
            return;
        }

        // 이미 처리 중이면 중복 처리 방지
        if (loading) return;

        setLoading(true);
        setIsActive(false); // 스캔 일시 중지

        try {
            // QR 코드 데이터 파싱
            const parsedData = parseQRCodeData(qrData);

            if (!parsedData) {
                Toast.show({
                    type: 'error',
                    text1: 'QR 코드 오류',
                    text2: '유효하지 않은 QR 코드입니다.'
                });
                if (onError) onError('유효하지 않은 QR 코드입니다.');
                setLoading(false);
                return;
            }

            // QR 코드 유효성 검사 (5분 이내 생성된 QR 코드만 유효)
            if (!isQRCodeValid(parsedData.timestamp)) {
                Toast.show({
                    type: 'error',
                    text1: 'QR 코드 만료',
                    text2: 'QR 코드가 만료되었습니다. 새로운 QR 코드를 스캔해주세요.'
                });
                if (onError) onError('QR 코드가 만료되었습니다.');
                setLoading(false);
                return;
            }

            // 사용자 ID 확인
            if (!user?.id) {
                Toast.show({
                    type: 'error',
                    text1: '사용자 정보 오류',
                    text2: '사용자 정보를 찾을 수 없습니다.'
                });
                if (onError) onError('사용자 정보를 찾을 수 없습니다.');
                setLoading(false);
                return;
            }

            // QR 코드로 출퇴근 인증
            const request = {
                employeeId: parseInt(user.id, 10),
                storeId: parsedData.storeId,
                qrCode: qrData
            };

            const response = isCheckingIn
                ? await verifyCheckInByQR(request)
                : await verifyCheckOutByQR(request);

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: isCheckingIn ? '출근 인증 성공' : '퇴근 인증 성공',
                    text2: isCheckingIn ? '성공적으로 출근 처리되었습니다.' : '성공적으로 퇴근 처리되었습니다.'
                });
                if (onSuccess) onSuccess(isCheckingIn);
            } else {
                Toast.show({
                    type: 'error',
                    text1: isCheckingIn ? '출근 인증 실패' : '퇴근 인증 실패',
                    text2: response.message || (isCheckingIn ? '출근 인증에 실패했습니다.' : '퇴근 인증에 실패했습니다.')
                });
                if (onError) onError(response.message || (isCheckingIn ? '출근 인증에 실패했습니다.' : '퇴근 인증에 실패했습니다.'));
            }
        } catch (error) {
            console.error('QR 코드 처리 오류:', error);
            Toast.show({
                type: 'error',
                text1: 'QR 코드 처리 오류',
                text2: '서버 통신 중 오류가 발생했습니다.'
            });
            if (onError) onError('서버 통신 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // QR 코드 스캔 결과 처리
    useEffect(() => {
        if (barcodes.length > 0 && isActive && !loading) {
            const qrData = barcodes[0].displayValue;
            if (qrData) {
                handleQRCodeScanned(qrData);
            }
        }
    }, [barcodes, isActive, loading]);

    // 컴포넌트 마운트 시 카메라 권한 요청
    useEffect(() => {
        requestCameraPermission();
    }, []);

    // 출퇴근 모드 전환
    const toggleMode = () => {
        setIsCheckingIn(!isCheckingIn);
    };

    // 스캔 시작/중지
    const toggleScanner = () => {
        setIsActive(!isActive);
    };

    return (
        <Card style={styles.container}>
            <Text style={styles.title}>QR 코드 출퇴근</Text>

            {/* 모드 선택 (출근/퇴근) */}
            <View style={styles.modeSelector}>
                <TouchableOpacity
                    style={[styles.modeButton, isCheckingIn && styles.modeButtonActive]}
                    onPress={() => setIsCheckingIn(true)}
                >
                    <Text style={[styles.modeButtonText, isCheckingIn && styles.modeButtonTextActive]}>출근</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeButton, !isCheckingIn && styles.modeButtonActive]}
                    onPress={() => setIsCheckingIn(false)}
                >
                    <Text style={[styles.modeButtonText, !isCheckingIn && styles.modeButtonTextActive]}>퇴근</Text>
                </TouchableOpacity>
            </View>

            {/* 카메라 권한 없음 */}
            {!hasPermission && (
                <View style={styles.permissionContainer}>
                    <Icon name="camera-slash" size={48} color={colors.error} style={styles.permissionIcon}/>
                    <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
                    <Text style={styles.permissionSubText}>QR 코드 스캔을 위해 카메라 접근 권한이 필요합니다.</Text>
                    <Button
                        title="권한 요청"
                        onPress={requestCameraPermission}
                        style={styles.permissionButton}
                    />
                </View>
            )}

            {/* QR 스캐너 */}
            {hasPermission && (
                <View style={styles.scannerContainer}>
                    {isActive ? (
                        <View style={styles.cameraContainer}>
                            <Camera
                                style={styles.camera}
                                device={Camera.getAvailableCameraDevices()[0]}
                                isActive={isActive}
                                frameProcessor={frameProcessor}
                            />
                            <View style={styles.scannerOverlay}>
                                <View style={styles.scannerMarker}/>
                            </View>
                            <Text style={styles.scannerText}>
                                {isCheckingIn ? '출근용' : '퇴근용'} QR 코드를 스캔해주세요
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.startScanContainer}>
                            <Icon name="qrcode" size={64} color={colors.primary} style={styles.qrIcon}/>
                            <Text style={styles.startScanText}>QR 코드 스캔을 시작하려면 아래 버튼을 눌러주세요</Text>
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <Button
                            title={isActive ? "스캔 중지" : "스캔 시작"}
                            onPress={toggleScanner}
                            loading={loading}
                            style={styles.scanButton}
                            type={isActive ? "secondary" : "primary"}
                        />
                        <Button
                            title={isCheckingIn ? "퇴근 모드로 전환" : "출근 모드로 전환"}
                            onPress={toggleMode}
                            disabled={isActive || loading}
                            style={styles.modeToggleButton}
                            type="outline"
                        />
                    </View>
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.md,
        color: colors.text,
    },
    modeSelector: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    modeButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: colors.primary,
    },
    modeButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
    },
    modeButtonTextActive: {
        color: 'white',
    },
    permissionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    permissionIcon: {
        marginBottom: spacing.md,
    },
    permissionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.error,
        marginBottom: spacing.xs,
    },
    permissionSubText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    permissionButton: {
        minWidth: 150,
    },
    scannerContainer: {
        alignItems: 'center',
    },
    cameraContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: spacing.md,
        position: 'relative',
    },
    camera: {
        width: '100%',
        height: '100%',
    },
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerMarker: {
        width: 200,
        height: 200,
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    scannerText: {
        position: 'absolute',
        bottom: spacing.md,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: spacing.xs,
        fontSize: 14,
    },
    startScanContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    qrIcon: {
        marginBottom: spacing.md,
    },
    startScanText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
    },
    scanButton: {
        marginBottom: spacing.sm,
    },
    modeToggleButton: {
        marginBottom: spacing.sm,
    },
});

export default QRAttendance;
