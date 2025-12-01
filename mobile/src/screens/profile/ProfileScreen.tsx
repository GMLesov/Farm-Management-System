import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {logoutUser} from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = ({navigation}: any) => {
  const dispatch = useDispatch();
  const {user} = useSelector((state: any) => state.auth);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', onPress: () => dispatch(logoutUser()), style: 'destructive'},
    ]);
  };

  const menuItems = [
    {id: 'settings', title: 'Settings', icon: 'cog', screen: 'Settings'},
    {id: 'notifications', title: 'Notifications', icon: 'bell', screen: 'Notifications'},
    {id: 'reports', title: 'Reports', icon: 'chart-line', screen: 'ReportDashboard'},
    {id: 'help', title: 'Help & Support', icon: 'help-circle'},
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="account-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.name}>{user?.name || 'Farm Manager'}</Text>
        <Text style={styles.email}>{user?.email || 'manager@farm.com'}</Text>
        <Text style={styles.role}>{user?.role || 'Manager'}</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => item.screen && navigation.navigate(item.screen)}>
            <Icon name={item.icon} size={24} color="#4CAF50" />
            <Text style={styles.menuText}>{item.title}</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {backgroundColor: '#fff', padding: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0'},
  avatarContainer: {marginBottom: 15},
  name: {fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5},
  email: {fontSize: 16, color: '#666', marginBottom: 5},
  role: {fontSize: 14, color: '#4CAF50', fontWeight: '600', textTransform: 'uppercase'},
  menuContainer: {backgroundColor: '#fff', marginTop: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e0e0e0'},
  menuItem: {flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'},
  menuText: {flex: 1, fontSize: 16, color: '#333', marginLeft: 15},
  logoutButton: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f44336', margin: 20, padding: 15, borderRadius: 8},
  logoutText: {fontSize: 16, color: '#fff', fontWeight: 'bold', marginLeft: 10},
});

export default ProfileScreen;
