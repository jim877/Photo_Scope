import { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import {
  getPending,
  clearPending,
  getLastTagsForRoom,
  setLastTagsForRoom,
} from '@/lib/pendingPhoto';
import { addPhoto } from '@/lib/db';
import { PRIMARY_REASONS, SUB_REASONS_BY_PRIMARY } from '@/lib/reasons';

export default function PhotoReviewScreen() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  const router = useRouter();
  const rid = Number(roomId);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [primaryReason, setPrimaryReason] = useState<string>('');
  const [subReason, setSubReason] = useState<string | null>(null);
  const [note, setNote] = useState<string>('');
  const [speakMode, setSpeakMode] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  useEffect(() => {
    const p = getPending();
    if (!p || p.roomId !== rid) {
      router.back();
      return;
    }
    const base = FileSystem.documentDirectory || '';
    setImageUri(base + p.uri);
    const last = getLastTagsForRoom(rid);
    if (last) {
      setPrimaryReason(last.primaryReason);
      setSubReason(last.subReason);
      setNote(last.note ?? '');
    } else {
      setPrimaryReason(PRIMARY_REASONS[0]?.value ?? '');
    }
  }, [rid, router]);

  const subOptions = primaryReason ? SUB_REASONS_BY_PRIMARY[primaryReason] ?? [] : [];
  const allOptions = primaryReason ? [primaryReason, ...subOptions] : [];

  const saveAndBack = () => {
    const p = getPending();
    if (!p || !imageUri) return;
    addPhoto(rid, p.uri.replace(FileSystem.documentDirectory || '', ''), primaryReason, subReason, note || null);
    setLastTagsForRoom(rid, { primaryReason, subReason, note: note || null });
    clearPending();
    router.back();
  };

  const saveAndTakeAnother = () => {
    const p = getPending();
    if (!p || !imageUri) return;
    addPhoto(rid, p.uri.replace(FileSystem.documentDirectory || '', ''), primaryReason, subReason, note || null);
    setLastTagsForRoom(rid, { primaryReason, subReason, note: note || null });
    clearPending();
    router.replace(`/order/${id}/room/${roomId}/camera`);
  };

  if (!imageUri) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      <View style={styles.overlay}>
        <View style={styles.tagsRow}>
          <Text style={styles.tag}>{primaryReason}</Text>
          {subReason ? <Text style={styles.tag}>{subReason}</Text> : null}
          {note ? <Text style={styles.tag}>{note}</Text> : null}
        </View>
      </View>
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <Text style={styles.label}>Primary reason</Text>
        <View style={styles.chipRow}>
          {PRIMARY_REASONS.map((r, i) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.chip, primaryReason === r.value && styles.chipSelected]}
              onPress={() => { setPrimaryReason(r.value); setSubReason(null); }}
            >
              <Text style={[styles.chipText, primaryReason === r.value && styles.chipTextSelected]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {subOptions.length > 0 && (
          <>
            <Text style={styles.label}>Sub-category</Text>
            <View style={styles.chipRow}>
              {subOptions.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, subReason === s && styles.chipSelected]}
                  onPress={() => setSubReason(s)}
                >
                  <Text style={[styles.chipText, subReason === s && styles.chipTextSelected]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <TouchableOpacity
          style={[styles.speakButton, speakMode && styles.speakButtonActive]}
          onPress={() => setSpeakMode(!speakMode)}
        >
          <Text style={styles.speakButtonText}>{speakMode ? 'Speak mode ON (say number, then "go")' : 'Speak mode'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={saveAndTakeAnother}>
          <Text style={styles.secondaryButtonText}>Take Another</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={saveAndBack}>
          <Text style={styles.primaryButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  image: { flex: 1, width: '100%' },
  overlay: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    overflow: 'hidden',
  },
  form: { maxHeight: 140, backgroundColor: '#f5f5f5' },
  formContent: { padding: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#333', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e5e7eb' },
  chipSelected: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 14 },
  chipTextSelected: { color: '#fff' },
  speakButton: { alignSelf: 'flex-start', padding: 10, backgroundColor: '#e5e7eb', borderRadius: 8 },
  speakButtonActive: { backgroundColor: '#a7f3d0' },
  speakButtonText: { fontSize: 14 },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#f5f5f5',
  },
  secondaryButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#e5e7eb', alignItems: 'center' },
  secondaryButtonText: { fontWeight: '600' },
  primaryButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#2563eb', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
});
