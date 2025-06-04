import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import dayjs from "dayjs";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";

const Dashboard = () => {
  const [donationHeaders, setDonationHeaders] = useState([]);
  const [donations, setDonations] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [contactHeaders, setContactHeaders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [volunteerHeaders, setVolunteerHeaders] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const [donateRes, contactRes, volunteerRes] = await Promise.all([
      fetchSheetData("donate"),
      fetchSheetData("contact"),
      fetchSheetData("register"),
    ]);
    setDonationHeaders(donateRes.headers);
    setAllDonations(donateRes.data);
    setDonations(donateRes.data.slice(0, 2));
    setContactHeaders(contactRes.headers);
    setAllContacts(contactRes.data);
    setContacts(contactRes.data.slice(0, 2));
    setVolunteerHeaders(volunteerRes.headers);
    setAllVolunteers(volunteerRes.data);
    setVolunteers(volunteerRes.data.slice(0, 2));
    setLastUpdated(dayjs().format("DD MMM YYYY, hh:mm A"));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3786b6" />
        <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    );
  }

  // Summary cards
  const totalDonationAmount = allDonations.reduce((sum, item) => {
    const idx = donationHeaders.indexOf("Amount");
    const amt = parseFloat(item[idx] || "0");
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

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
      <View style={styles.recentCard}>
        <View style={styles.recentIconCircle}>
          <FontAwesome5 name="hand-holding-heart" size={20} color="#8e2273" />
        </View>
        <Text style={styles.recentTitle}>{name}</Text>
        <Text style={styles.recentAmount}>₹{amount}</Text>
        <Text style={styles.recentDate}>{formattedDate}</Text>
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
      <View style={styles.recentCard}>
        <View style={[styles.recentIconCircle, { backgroundColor: "#e3f2fd" }]}>
          <MaterialIcons name="contact-mail" size={20} color="#3786b6" />
        </View>
        <Text style={styles.recentTitle}>{name}</Text>
        <Text style={styles.recentSub}>{email}</Text>
        <Text style={styles.recentSub}>{phone}</Text>
        <Text style={styles.recentDate}>{formattedDate}</Text>
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
      <View style={styles.recentCard}>
        <View style={[styles.recentIconCircle, { backgroundColor: "#e8f5e9" }]}>
          <Ionicons name="people" size={20} color="#4caf50" />
        </View>
        <Text style={styles.recentTitle}>{name}</Text>
        <Text style={styles.recentSub}>{city}</Text>
        <Text style={styles.recentSub}>{occupation}</Text>
        <Text style={styles.recentDate}>{formattedDate}</Text>
      </View>
    );
  };

  // Section header with optional "View All"
  const SectionHeader = ({ icon, color, children }) => (
    <View style={styles.sectionHeaderRow}>
      {icon}
      <Text style={[styles.sectionTitle, { color }]}>{children}</Text>
      {/* <TouchableOpacity style={styles.viewAllBtn}><Text style={styles.viewAllText}>View All</Text></TouchableOpacity> */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.header}>Dashboard</Text>
        <Text style={styles.lastUpdated}>
          Last updated: {lastUpdated}
        </Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: "#e3f2fd" }]}>
            <FontAwesome5 name="donate" size={28} color="#3786b6" />
            <Text style={styles.summaryValue}>₹{totalDonationAmount}</Text>
            <Text style={styles.summaryLabel}>Total Donations</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#f3e5f5" }]}>
            <MaterialIcons name="contacts" size={28} color="#8e2273" />
            <Text style={styles.summaryValue}>{allContacts.length}</Text>
            <Text style={styles.summaryLabel}>Contacts</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#e8f5e9" }]}>
            <Ionicons name="people" size={28} color="#4caf50" />
            <Text style={styles.summaryValue}>{allVolunteers.length}</Text>
            <Text style={styles.summaryLabel}>Volunteers</Text>
          </View>
        </View>

        {/* Recent Donations */}
        <SectionHeader
          icon={<FontAwesome5 name="hand-holding-heart" size={18} color="#8e2273" style={{ marginRight: 8 }} />}
          color="#8e2273"
        >
          Recent Donations
        </SectionHeader>
        <FlatList
          data={donations}
          renderItem={renderDonation}
          keyExtractor={(_, index) => `donation-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No donations yet.</Text>}
          style={styles.recentList}
          contentContainerStyle={styles.recentListContent}
        />

        {/* Recent Contacts */}
        <SectionHeader
          icon={<MaterialIcons name="contact-mail" size={18} color="#3786b6" style={{ marginRight: 8 }} />}
          color="#3786b6"
        >
          Recent Contacts
        </SectionHeader>
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(_, index) => `contact-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No contacts yet.</Text>}
          style={styles.recentList}
          contentContainerStyle={styles.recentListContent}
        />

        {/* Recent Volunteers */}
        <SectionHeader
          icon={<Ionicons name="people" size={18} color="#4caf50" style={{ marginRight: 8 }} />}
          color="#4caf50"
        >
          Recent Volunteers
        </SectionHeader>
        <FlatList
          data={volunteers}
          renderItem={renderVolunteer}
          keyExtractor={(_, index) => `volunteer-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No volunteers yet.</Text>}
          style={styles.recentList}
          contentContainerStyle={styles.recentListContent}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: "#f9f9f9", marginBottom: 50 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3786b6",
    marginTop: 18,
    marginLeft: 18,
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#888",
    marginLeft: 18,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 6,
    color: "#222",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 18,
    marginTop: 16,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllBtn: {
    marginLeft: "auto",
    marginRight: 18,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f3e5f5",
  },
  viewAllText: {
    color: "#8e2273",
    fontWeight: "600",
    fontSize: 13,
  },
  recentList: {
    minHeight: 160,
    marginBottom: 8,
    marginLeft: 8,
  },
  recentListContent: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  recentCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginRight: 14,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "flex-start",
    justifyContent: "center",
  },
  recentIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3e5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3786b6",
    marginBottom: 2,
  },
  recentAmount: {
    fontSize: 16,
    color: "#8e2273",
    fontWeight: "bold",
    marginBottom: 2,
  },
  recentSub: {
    fontSize: 13,
    color: "#555",
    marginBottom: 1,
  },
  recentDate: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontStyle: "italic",
    marginVertical: 8,
    marginLeft: 18,
  },
});
