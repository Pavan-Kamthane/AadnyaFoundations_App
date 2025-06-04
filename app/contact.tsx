import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

const Contact = () => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (raw: string) => {
    const date = new Date(raw);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // enables AM/PM
    };
    return date.toLocaleString('en-GB', options).replace(',', '');
  };
  

  const fetchSheetData = async (sheetName: string) => {
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbyPvEQ9Wu3F-7jfDw-71J2KYT7lP9MGq0FqJWNMjvPVNAJVlrfXQmPkbM4Tm4BaG8adJA/exec',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            action: 'getData',
            sheet: sheetName,
          }).toString(),
        }
      );

      const result = await response.json();
      setHeaders(result.headers);
      setData(result.data);
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData('contact');
  }, []);

  const renderItem = ({ item }: { item: string[] }) => (
    <View style={styles.card}>
      <Text style={styles.cardName}>{item[0]}</Text>
      <Text style={styles.label}>Email: {item[1]}</Text>
      <Text style={styles.label}>Phone: {item[2]}</Text>
      <Text style={styles.label}>Subject: {item[3]}</Text>
      <Text style={styles.message}>Message: {item[4]}</Text>
      <Text style={styles.timestamp}>{formatDateTime(item[5])}</Text>

    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8e2273" />
        <Text style={{ marginTop: 10, color: '#888' }}>Loading contact messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Contact Submissions</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Messages</Text>
          <Text style={styles.summaryValue}>{data.length}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Message List</Text>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Contact;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    margin: 16,
    marginBottom: 70,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3786b6',
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#8e2273',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#3786b6',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3786b6',
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginTop: 6,
  },
  message: {
    fontSize: 13,
    color: '#000',
    marginTop: 8,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 6,
    textAlign: 'right',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
