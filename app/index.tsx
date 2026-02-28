import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { initDb, listOrders } from '@/lib/db';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<{ id: number; createdAt: string }[]>([]);

  useEffect(() => {
    (async () => {
      await initDb();
      const list = await listOrders();
      setOrders(list);
    })();
  }, []);

  const addOrder = async () => {
    const { createOrder } = await import('@/lib/db');
    const id = await createOrder();
    router.push(`/order/${id}/index`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={addOrder}>
        <Text style={styles.addButtonText}>+ New Order</Text>
      </TouchableOpacity>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderRow}
            onPress={() => router.push(`/order/${item.id}/index`)}
          >
            <Text style={styles.orderTitle}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet. Create one to start.</Text>}
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
  orderRow: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  orderTitle: { fontSize: 16, fontWeight: '600' },
  orderDate: { fontSize: 14, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
});
