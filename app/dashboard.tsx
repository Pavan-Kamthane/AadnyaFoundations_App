import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import dayjs from "dayjs";

const Dashboard = () => {
  // States for each data set
  const [donationHeaders, setDonationHeaders] = useState([]);
  const [donations, setDonations] = useState([]);
  const [contactHeaders, setContactHeaders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [volunteerHeaders, setVolunteerHeaders] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const [loading, setLoading] = useState(true);

  // Fetch data from given sheet and return sorted data by Timestamp descending
  const fetchSheetData = async (sheetName) => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyPvEQ9Wu3F-7jfDw-71J2KYT7lP9MGq0FqJWNMjvPVNAJVlrfXQmPkbM4Tm4BaG8adJA/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            action: "getData",
            sheet: sheetName,
          }).toString(),
        }
      );

      const result = await response.json();
      const timestampIndex = result.headers.indexOf("Timestamp");
      const sortedData = result.data.sort((a, b) => {
        const timeA = dayjs(a[timestampIndex]);
        const timeB = dayjs(b[timestampIndex]);
        return timeB - timeA;
      });

      return { headers: result.headers, data: sortedData };
    } catch (error) {
      console.error(`Error fetching ${sheetName} data:`, error);
      return { headers: [], data: [] };
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      const [donateRes, contactRes, volunteerRes] = await Promise.all([
        fetchSheetData("donate"),
        fetchSheetData("contact"),
        fetchSheetData("register"),
      ]);

      setDonationHeaders(donateRes.headers);
      setDonations(donateRes.data.slice(0, 5)); // only 5 recent donations

      setContactHeaders(contactRes.headers);
      setContacts(contactRes.data.slice(0, 5)); // only 5 recent contacts

      setVolunteerHeaders(volunteerRes.headers);
      setVolunteers(volunteerRes.data.slice(0, 5)); // only 5 recent volunteers

      setLoading(false);
    };

    loadAllData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3786b6" />
        <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    );
  }

  // Render donation item
  const renderDonation = ({ item }) => {
    if (!item || item.length === 0) return null;

    const name = item[donationHeaders.indexOf("Full Name")] || "Anonymous";
    const amount = item[donationHeaders.indexOf("Amount")] || "0";
    const rawDate = item[donationHeaders.indexOf("Timestamp")];
    const formattedDate = rawDate
      ? dayjs(rawDate).format("DD MMM YYYY, hh:mm A")
      : "N/A";

    return (
      <View style={styles.card}>
        <Text style={styles.cardName}>{name}</Text>
        <Text>Amount: ₹{amount}</Text>
        <Text>Date: {formattedDate}</Text>
      </View>
    );
  };

  // Render contact item
  const renderContact = ({ item }) => {
    if (!item || item.length === 0) return null;

    const name = item[contactHeaders.indexOf("Full Name")] || "Unknown";
    const email = item[contactHeaders.indexOf("Email Address")] || "-";
    const phone = item[contactHeaders.indexOf("Phone Number")] || "-";
    const rawDate = item[contactHeaders.indexOf("Timestamp")];
    const formattedDate = rawDate
      ? dayjs(rawDate).format("DD MMM YYYY, hh:mm A")
      : "N/A";

    return (
      <View style={styles.card}>
        <Text style={styles.cardName}>{name}</Text>
        <Text>Email: {email}</Text>
        <Text>Phone: {phone}</Text>
        <Text>Date: {formattedDate}</Text>
      </View>
    );
  };

  // Render volunteer item
  const renderVolunteer = ({ item }) => {
    if (!item || item.length === 0) return null;

    const name = item[volunteerHeaders.indexOf("Full Name")] || "Unknown";
    const city = item[volunteerHeaders.indexOf("City")] || "-";
    const occupation = item[volunteerHeaders.indexOf("Occupation")] || "-";
    const rawDate = item[volunteerHeaders.indexOf("Timestamp")];
    const formattedDate = rawDate
      ? dayjs(rawDate).format("DD MMM YYYY, hh:mm A")
      : "N/A";

    return (
      <View style={styles.card}>
        <Text style={styles.cardName}>{name}</Text>
        <Text>City: {city}</Text>
        <Text>Occupation: {occupation}</Text>
        <Text>Date: {formattedDate}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.header}>Dashboard</Text>

        <Text style={styles.sectionTitle}>Recent Donations</Text>
        <FlatList
          data={donations}
          renderItem={renderDonation}
          keyExtractor={(_, index) => `donation-${index}`}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>Recent Contacts</Text>
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(_, index) => `contact-${index}`}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>Recent Volunteers</Text>
        <FlatList
          data={volunteers}
          renderItem={renderVolunteer}
          keyExtractor={(_, index) => `volunteer-${index}`}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9",margin:16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3786b6",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#8e2273",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3786b6",
    marginBottom: 4,
  },
});
