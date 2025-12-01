import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LeaveScreen = ({navigation}: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([
    {id: '1', type: 'Sick Leave', startDate: '2025-12-01', endDate: '2025-12-03', status: 'pending', days: 3},
    {id: '2', type: 'Annual Leave', startDate: '2025-12-15', endDate: '2025-12-20', status: 'approved', days: 5},
    {id: '3', type: 'Emergency Leave', startDate: '2025-11-20', endDate: '2025-11-20', status: 'rejected', days: 1},
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'check-circle';
      case 'pending': return 'clock-outline';
      case 'rejected': return 'close-circle';
      default: return 'circle';
    }
  };

  const renderLeaveRequest = ({item}: any) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.leaveType}>{item.type}</Text>
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status) + '20'}]}>
          <Icon name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, {color: getStatusColor(item.status)}]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.dateRow}>
          <Icon name="calendar-start" size={20} color="#666" />
          <Text style={styles.dateText}>{new Date(item.startDate).toLocaleDateString()}</Text>
          <Icon name="arrow-right" size={20} color="#666" style={{marginHorizontal: 10}} />
          <Icon name="calendar-end" size={20} color="#666" />
          <Text style={styles.dateText}>{new Date(item.endDate).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.daysText}>{item.days} day{item.days > 1 ? 's' : ''}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Icon name="calendar-check" size={32} color="#4CAF50" />
          <Text style={styles.summaryNumber}>12</Text>
          <Text style={styles.summaryLabel}>Days Used</Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="calendar-blank" size={32} color="#2196F3" />
          <Text style={styles.summaryNumber}>18</Text>
          <Text style={styles.summaryLabel}>Days Left</Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="calendar-clock" size={32} color="#FF9800" />
          <Text style={styles.summaryNumber}>1</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>
      <FlatList
        data={leaveRequests}
        renderItem={renderLeaveRequest}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No leave requests</Text>}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.fab} onPress={() => {}}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  summaryContainer: {flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0'},
  summaryCard: {flex: 1, alignItems: 'center', padding: 10},
  summaryNumber: {fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 5},
  summaryLabel: {fontSize: 12, color: '#666', marginTop: 5},
  listContent: {padding: 10},
  card: {backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15},
  leaveType: {fontSize: 16, fontWeight: 'bold', color: '#333'},
  statusBadge: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12},
  statusText: {fontSize: 12, fontWeight: 'bold', marginLeft: 5},
  cardBody: {borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10},
  dateRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  dateText: {fontSize: 14, color: '#666', marginLeft: 5},
  daysText: {fontSize: 14, color: '#4CAF50', fontWeight: '600'},
  emptyText: {textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999'},
  fab: {position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4},
});

export default LeaveScreen;
