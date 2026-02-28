import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { listFloors, addFloor } from '@/lib/db';
import type { FloorRow } from '@/lib/db';

export default function FloorsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(id);
  const [floors, setFloors] = useState<FloorRow[]>([]);

  useEffect(() => {
    setFloors(listFloors(orderId));
  }, [orderId]);

  const addNewFloor = async () => {
    const floorNumber = floors.length + 1;
    const floorId = addFloor(orderId, `Floor ${floorNumber}`);
    setFloors(listFloors(orderId));
    router.push(`/order/${id}/floor/${floorId}/rooms`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={addNewFloor}>
        <Text style={styles.addButtonText}>+ Add Floor</Text>
      </TouchableOpacity>
      <FlatList
        data={floors}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/order/${id}/floor/${item.id}/rooms`)}
          >
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowMeta}>PU · TLI · InHome</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No floors. Add one to add rooms.</Text>}
      />
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
  rowMeta: { fontSize: 14, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
});
