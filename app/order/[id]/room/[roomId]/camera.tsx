import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { setPending } from '@/lib/pendingPhoto';

export default function CameraScreen() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (!cameraRef.current || !permission?.granted) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.8 });
      if (!photo?.uri) return;
      const dir = FileSystem.documentDirectory + 'photo_scope/';
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const filename = `img_${Date.now()}.jpg`;
      await FileSystem.moveAsync({ from: photo.uri, to: dir + filename });
      setPending(Number(id), Number(roomId), 'photo_scope/' + filename);
      router.push({ pathname: `/order/${id}/room/${roomId}/photo-review` });
    } catch (e) {
      console.error(e);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera access is required to capture photos.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        onCameraReady={() => setReady(true)}
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.captureButton, !ready && styles.captureDisabled]}
          onPress={takePicture}
          disabled={!ready}
        >
          <Text style={styles.captureText}>Capture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  button: { marginTop: 16, backgroundColor: '#2563eb', padding: 16, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureDisabled: { opacity: 0.5 },
  captureText: { fontSize: 12, color: '#000' },
});
