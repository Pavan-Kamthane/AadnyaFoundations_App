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
import dayjs from 'dayjs';

const Donations = () => {
    const [headers, setHeaders] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

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

            setHeaders(result.headers);
            setData(sortedData);
        } catch (error) {
            console.error("Error fetching sheet data:", error);
        } finally {
            setLoading(false);
        }
    };
      

    useEffect(() => {
        fetchSheetData("donate");
        
    }, []);

    const renderItem = ({ item }) => {
        if (!item || item.length === 0) return null;

        const name = item[headers.indexOf("Full Name")] || "Anonymous";
        const amount = item[headers.indexOf("Amount")] || "0";
        const rawDate = item[headers.indexOf("Timestamp")];
        const formattedDate = rawDate ? dayjs(rawDate).format('DD MMMM YYYY, hh:mm A') : 'N/A';

        return (
            <TouchableOpacity
                onPress={() => {
                    setSelectedDonation(item);
                    setModalVisible(true);
                }}
            >
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardName}>{name}</Text>
                        <Text style={styles.status}>Completed</Text>
                    </View>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.amount}>₹{amount}</Text>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{formattedDate}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#8e2273" />
                <Text style={{ marginTop: 10 }}>Loading Donations...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Donation Management</Text>
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Total Donations</Text>
                    <Text style={styles.summaryValue}>
                        ₹{data.reduce((acc, cur) => acc + (parseInt(cur[headers.indexOf("Amount")]) || 0), 0)}
                    </Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Total Donors</Text>
                    <Text style={styles.summaryValue}>{data.length}</Text>
                </View>
            </View>
            <Text style={styles.sectionTitle}>Recent Donations</Text>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 60 }}
            />

            {/* Modal */}
            {selectedDonation && (
                <Modal visible={modalVisible} transparent={true} animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Donation Details</Text>
                            <Text>Name: {selectedDonation[headers.indexOf("Full Name")]}</Text>
                            <Text>Email: {selectedDonation[headers.indexOf("Email Address")]}</Text>
                            <Text>Phone: {selectedDonation[headers.indexOf("Phone Number")]}</Text>
                            <Text>Transaction ID: {selectedDonation[headers.indexOf("Transaction ID")]}</Text>
                            <Text>Message: {selectedDonation[headers.indexOf("Message (Optional)")] || "N/A"}</Text>
                            <Text>Amount: ₹{selectedDonation[headers.indexOf("Amount")]}</Text>
                            <Text>Date: {dayjs(selectedDonation[headers.indexOf("Timestamp")]).format('DD MMMM YYYY, hh:mm A')}</Text>
                            <TouchableOpacity style={styles.printBtn} onPress={() => console.log("Print receipt")}>
                                <Text style={styles.printText}>Print Receipt</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.printText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
};

export default Donations;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        // backgroundColor: '#f9f9f9',
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
    },
    summaryTitle: {
        fontSize: 14,
        color: '#3786b6',
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
        color: '#3786b6',
        fontWeight: 'bold',
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginTop: 6,
    },
    value: {
        fontSize: 14,
        color: '#444',
    },
    amount: {
        fontSize: 16,
        color: '#8e2273',
        fontWeight: 'bold',
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
        color: '#3786b6',
        marginBottom: 10,
    },
    printBtn: {
        backgroundColor: '#8e2273',
        padding: 10,
        borderRadius: 8,
        marginTop: 15,
    },
    closeBtn: {
        backgroundColor: '#555',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    printText: {
        color: '#fff',
        textAlign: 'center',
    },
});
