import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ScheduleScreen = ({navigation}: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState([
    {id: '1', title: 'Morning Feed - Cattle', time: '06:00 AM', type: 'feeding', icon: 'cow'},
    {id: '2', title: 'Irrigation - Zone A', time: '07:30 AM', type: 'irrigation', icon: 'water'},
    {id: '3', title: 'Pest Inspection', time: '10:00 AM', type: 'inspection', icon: 'bug'},
    {id: '4', title: 'Crop Harvest - Wheat', time: '02:00 PM', type: 'harvest', icon: 'corn'},
    {id: '5', title: 'Equipment Maintenance', time: '04:00 PM', type: 'maintenance', icon: 'tools'},
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feeding': return '#FF9800';
      case 'irrigation': return '#2196F3';
      case 'inspection': return '#9C27B0';
      case 'harvest': return '#4CAF50';
      case 'maintenance': return '#F44336';
      default: return '#757575';
    }
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return {firstDay, daysInMonth};
  };

  const {firstDay, daysInMonth} = getDaysInMonth();
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const blanks = Array.from({length: firstDay}, (_, i) => null);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => {
          const newDate = new Date(selectedDate);
          newDate.setMonth(newDate.getMonth() - 1);
          setSelectedDate(newDate);
        }}>
          <Icon name="chevron-left" size={30} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedDate.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
        </Text>
        <TouchableOpacity onPress={() => {
          const newDate = new Date(selectedDate);
          newDate.setMonth(newDate.getMonth() + 1);
          setSelectedDate(newDate);
        }}>
          <Icon name="chevron-right" size={30} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarGrid}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <Text key={i} style={styles.dayHeader}>{day}</Text>
        ))}
        {[...blanks, ...days].map((day, i) => (
          <TouchableOpacity key={i} style={styles.dayCell} disabled={!day}>
            <Text style={[styles.dayText, !day && styles.emptyDay]}>{day || ''}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.scheduleHeader}>
        <Text style={styles.sectionTitle}>Today\'s Schedule</Text>
        <TouchableOpacity>
          <Icon name="plus-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {schedules.map(schedule => (
        <TouchableOpacity key={schedule.id} style={styles.scheduleCard}>
          <View style={[styles.iconContainer, {backgroundColor: getTypeColor(schedule.type)}]}>
            <Icon name={schedule.icon} size={24} color="#fff" />
          </View>
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleTitle}>{schedule.title}</Text>
            <Text style={styles.scheduleTime}>{schedule.time}</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  calendarHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff'},
  monthText: {fontSize: 20, fontWeight: 'bold', color: '#333'},
  calendarGrid: {flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', padding: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0'},
  dayHeader: {width: '14.28%', textAlign: 'center', fontWeight: 'bold', color: '#4CAF50', marginBottom: 10},
  dayCell: {width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center'},
  dayText: {fontSize: 16, color: '#333'},
  emptyDay: {color: 'transparent'},
  scheduleHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20},
  sectionTitle: {fontSize: 20, fontWeight: 'bold', color: '#333'},
  scheduleCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 10, marginTop: 0, padding: 15, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4},
  iconContainer: {width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 15},
  scheduleInfo: {flex: 1},
  scheduleTitle: {fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5},
  scheduleTime: {fontSize: 14, color: '#666'},
});

export default ScheduleScreen;
