import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { listPhotos, listRooms } from '@/lib/db';
import type { PhotoRow, RoomRow } from '@/lib/db';
import * as FileSystem from 'expo-file-system';

export default function RoomScreen() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  const router = useRouter();
  const rid = Number(roomId);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [room, setRoom] = useState<RoomRow | null>(null);

  useEffect(() => {
    const rooms = listRooms(Number(id));
    setRoom(rooms.find((r) => r.id === rid) ?? null);
    setPhotos(listPhotos(rid));
  }, [id, roomId, rid]);

  const openCamera = () => router.push(`/order/${id}/room/${roomId}/camera`);

  if (!room) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{room.display_name}</Text>
      <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
        <Text style={styles.cameraButtonText}>Open camera</Text>
      </TouchableOpacity>
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.thumb}
            onPress={() => {}}
          >
            <Image source={{ uri: FileSystem.documentDirectory + item.file_path }} style={styles.thumbImage} />
            <Text style={styles.thumbLabel} numberOfLines={1}>{item.primary_reason}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No photos. Open camera to capture.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  cameraButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  cameraButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  thumb: { flex: 1/3, aspectRatio: 1, padding: 4 },
  thumbImage: { width: '100%', height: '100%', borderRadius: 8 },
  thumbLabel: { fontSize: 10, color: '#333', marginTop: 2 },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
});
