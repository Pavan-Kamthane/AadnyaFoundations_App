import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
} from 'react-native';

const Volunteers = () => {
    const [headers, setHeaders] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchSheetData = async (sheetName) => {
        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbyPvEQ9Wu3F-7jfDw-71J2KYT7lP9MGq0FqJWNMjvPVNAJVlrfXQmPkbM4Tm4BaG8adJA/exec", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    action: "getData",
                    sheet: sheetName
                }).toString()
            });

            const result = await response.json();
            setHeaders(result.headers);
            setData(result.data);
        } catch (error) {
            console.error("Error fetching sheet data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSheetData("register");
    }, []);

    const renderItem = ({ item }) => {
        if (!item || item.length === 0) return null;

        const name = item[headers.indexOf("Full Name")] || "Unnamed";
        const status = item[headers.indexOf("Status")] || "Pending";

        return (
            <TouchableOpacity
                onPress={() => {
                    setSelectedVolunteer(item);
                    setModalVisible(true);
                }}
            >
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardName}>{name}</Text>
                        <Text style={[styles.status, { color: status === 'Approved' ? 'green' : '#e67e22' }]}>{status}</Text>
                    </View>
                    <Text style={styles.label}>Tap to view details</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const totalVolunteers = data.length;
    const pendingApplications = data.filter(
        (item) => item[headers.indexOf("Status")]?.toLowerCase() === "pending"
    ).length;

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#8e2273" />
                <Text style={{ marginTop: 10 }}>Loading Volunteers...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Volunteer Management</Text>
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Total Volunteers</Text>
                    <Text style={styles.summaryValue}>{totalVolunteers}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Pending Applications</Text>
                    <Text style={styles.summaryValue}>{pendingApplications}</Text>
                </View>
            </View>
            <Text style={styles.sectionTitle}>Volunteer List</Text>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 60 }}
            />

            {/* Modal */}
            {selectedVolunteer && (
                <Modal visible={modalVisible} transparent={true} animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Volunteer Details</Text>
                            {headers.map((header, index) => (
                                <Text key={index}>
                                    {header}: {selectedVolunteer[index] || "N/A"}
                                </Text>
                            ))}
                            <TouchableOpacity style={styles.approveBtn}>
                                <Text style={styles.btnText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectBtn}>
                                <Text style={styles.btnText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
};

export default Volunteers;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        margin: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3786b6',
        marginBottom: 16,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginHorizontal: 5,
        elevation: 2,
        borderLeftWidth: 5,
        borderLeftColor: '#8e2273', // secondary accent bar
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
        borderLeftWidth: 4,
        borderLeftColor: '#8e2273',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3786b6',
    },
    status: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8e2273',
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginTop: 6,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8e2273',
        marginBottom: 10,
    },
    approveBtn: {
        backgroundColor: '#3786b6', 
        padding: 10,
        borderRadius: 8,
        marginTop: 15,
    },
    rejectBtn: {
        backgroundColor: '#8e2273', // deep red
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        // color: '#8e2273',
        // color of text    
        // To set the text color for the reject button, override btnText in the TouchableOpacity or use a custom style.

    },
    
    btnText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    closeBtn: {
        backgroundColor: 'black', // secondary color
        borderWidth: 1,
        borderColor: '#8e2273',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        color: '#8e2273',
    },
});

