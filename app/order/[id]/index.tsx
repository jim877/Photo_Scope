import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getOrder, listFloors } from '@/lib/db';
import type { OrderRow, FloorRow } from '@/lib/db';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(id);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [floors, setFloors] = useState<FloorRow[]>([]);

  useEffect(() => {
    setOrder(getOrder(orderId) ?? null);
    setFloors(listFloors(orderId));
  }, [orderId]);

  const goToFloors = () => router.push(`/order/${id}/floors`);

  if (!order) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{order.id}</Text>
      <TouchableOpacity style={styles.card} onPress={goToFloors}>
        <Text style={styles.cardTitle}>Floors</Text>
        <Text style={styles.cardSub}>{floors.length} floor(s)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSub: { fontSize: 14, color: '#666', marginTop: 4 },
});
