import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { listRooms, listFloors, addRoom } from '@/lib/db';
import type { RoomRow } from '@/lib/db';

export default function RoomsScreen() {
  const { id, floorId } = useLocalSearchParams<{ id: string; floorId: string }>();
  const router = useRouter();
  const fid = Number(floorId);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [floorNumber, setFloorNumber] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    const floors = listFloors(Number(id));
    const floorIndex = floors.findIndex((f) => f.id === fid);
    setFloorNumber(floorIndex >= 0 ? floorIndex + 1 : 1);
    setRooms(listRooms(fid));
  }, [id, fid]);

  const addNewRoom = () => {
    if (!newRoomName.trim()) return;
    addRoom(fid, newRoomName.trim(), floorNumber);
    setRooms(listRooms(fid));
    setNewRoomName('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Room</Text>
      </TouchableOpacity>
      <FlatList
        data={rooms}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/order/${id}/room/${item.id}/index`)}
          >
            <Text style={styles.rowTitle}>{item.display_name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No rooms. Add one to start taking photos.</Text>}
      />
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New room</Text>
            <TextInput
              style={styles.input}
              placeholder="Room name (e.g. Kitchen)"
              value={newRoomName}
              onChangeText={setNewRoomName}
              autoCapitalize="words"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOk} onPress={addNewRoom}>
                <Text style={styles.modalOkText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  addButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  row: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { padding: 12 },
  modalOk: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8 },
  modalOkText: { color: '#fff', fontWeight: '600' },
});
