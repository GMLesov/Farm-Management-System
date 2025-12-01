import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationData } from '../types/notification';

interface NotificationItemProps {
  notification: NotificationData;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead, onDelete }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'animal_health': return '🏥';
      case 'feed_alert': return '🌾';
      case 'veterinary_reminder': return '💊';
      case 'breeding_update': return '🐄';
      case 'system_alert': return '⚠️';
      default: return '📢';
    }
  };

  return (
    <div 
      style={{
        padding: '12px',
        margin: '8px 0',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: notification.isRead ? '#f8f9fa' : '#fff',
        borderLeft: `4px solid ${getSeverityColor(notification.severity)}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>
              {getTypeIcon(notification.type)}
            </span>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span 
                style={{
                  marginLeft: '8px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}
              >
                NEW
              </span>
            )}
          </div>
          <p style={{ margin: '8px 0', color: '#6c757d' }}>
            {notification.message}
          </p>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#8e9297' }}>
            <span>Type: {notification.type.replace('_', ' ')}</span>
            <span>Severity: {notification.severity}</span>
            <span>Time: {new Date(notification.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
          {!notification.isRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Mark Read
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface NotificationsPanelProps {
  farmId?: string;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ farmId }) => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    error,
    pagination,
    markAsRead,
    deleteNotification,
    refresh,
    connect,
    disconnect
  } = useNotifications({
    farmId,
    autoConnect: true,
    enableRealtime: true,
    filters: showUnreadOnly ? { isRead: false } : {},
    pagination: { page: currentPage, limit: 10 }
  });

  const handleConnectionToggle = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>
          Farm Notifications
          {unreadCount > 0 && (
            <span 
              style={{
                marginLeft: '8px',
                backgroundColor: '#dc3545',
                color: 'white',
                fontSize: '14px',
                padding: '2px 8px',
                borderRadius: '12px'
              }}
            >
              {unreadCount}
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
              color: isConnected ? '#155724' : '#721c24',
              fontSize: '12px'
            }}
          >
            <span style={{ marginRight: '4px' }}>
              {isConnected ? '🟢' : '🔴'}
            </span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <button
            onClick={handleConnectionToggle}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: isConnected ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => {
              setShowUnreadOnly(e.target.checked);
              setCurrentPage(1);
            }}
          />
          Show unread only
        </label>
        <button
          onClick={refresh}
          disabled={isLoading}
          style={{
            padding: '6px 12px',
            fontSize: '14px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div 
          style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          Loading notifications...
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && notifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          {showUnreadOnly ? 'No unread notifications' : 'No notifications found'}
        </div>
      )}

      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={markAsRead}
          onDelete={deleteNotification}
        />
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrev}
            style={{
              padding: '8px 16px',
              backgroundColor: pagination.hasPrev ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: pagination.hasPrev ? 'pointer' : 'not-allowed'
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 16px', alignSelf: 'center' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNext}
            style={{
              padding: '8px 16px',
              backgroundColor: pagination.hasNext ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: pagination.hasNext ? 'pointer' : 'not-allowed'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;