import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, ScrollView, Dimensions, Modal } from 'react-native';
import * as Sqlite from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const db = Sqlite.openDatabase('Example.db')

const width = Dimensions.get("window").width > 425

export default function Details(props) {

    const { colors } = useTheme()
    const [patientData, setPatientData] = useState([{ Name: "", Age: "", Gender: "", Contact: "", Address: "", VisitedDate: "00/00/0000" }])
    const [prescriptionIds, setPrescriptionIds] = useState([])
    const [prescription, setPrescription] = useState([])
    const [show, setShow] = useState(false)
    const [compare, setCompare] = useState(false)
    const [id, setId] = useState("")
    const [prescription2, setPrescription2] = useState([])
    const [show2, setShow2] = useState(false)

    useEffect(() => {

        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM Patient WHERE Patient.Contact="${props.route.params.Id}"`, [], (_, { rows:   { _array } }) => {
                setPatientData(_array)
            })
        })


        db.transaction((tx) => {
            tx.executeSql(`SELECT Pr.PrescriptionId FROM Patient P JOIN Prescription Pr ON Pr.PatientId=P.Contact WHERE P.Contact="${props.route.params.Id}"`, [], (_, { rows:   { _array } }) => {
                setPrescriptionIds(_array)
            })
        })


    }, [])

    const showPrescription = (val) => {
        console.log(val)
        if (val) {
            setShow(true)
            db.transaction((tx) => {
                tx.executeSql(`SELECT * FROM Prescription WHERE PrescriptionId="${val}"`, [], (_, { rows:   { _array } }) => {
                    setPrescription(JSON.parse(_array[0].Examination))
                })
            })
        }
        else {
            setShow(false)
            setPrescription([])
        }
    }

    const htmlContent = `<html><body></body></html>`

    const createPDF = async () => {

        Print.printAsync(
            {
                html: htmlContent
            },
        ).then(res => console.log(res))

    };

    const sharePDF = async () => {

        Print.printToFileAsync({
            html: htmlContent,
        }).then(res => {
            openShareDialogAsync(res.uri)
        })

    };

    async function openShareDialogAsync(link) {
        if (!(await Sharing.isAvailableAsync())) {
            alert(`Uh oh, sharing isn't available on your platform`);
            return;
        }
        Sharing.shareAsync(link);
    };

    const showPrescription2 = (val) => {
        if (val) {
            setShow2(true)
            db.transaction((tx) => {
                tx.executeSql(`SELECT * FROM Prescription WHERE PrescriptionId="${val}"`, [], (_, { rows:   { _array } }) => {
                    let examination = JSON.parse(_array[0].Examination)
                    setPrescription2(examination)
                })
            })
        }
        else {
            setShow2(false)
            setPrescription2([])
        }
    }

    return (
        <>
            <ScrollView style={{ backgroundColor: colors.back }}>
                <Text style={styles.header}>Patient Details</Text>
                <View>
                    {patientData.map((item) => (
                        <View key={item.Contact}>
                            <View style={styles.element}>
                                <Text style={[styles.heading, { color: colors.txt }]}>Name </Text>
                                <Text style={[styles.data, { color: colors.txt }]}>:   {item.Name}</Text>
                            </View>

                            <View style={styles.element}>
                                <Text style={[styles.heading, { color: colors.txt }]}>Age </Text>
                                <Text style={[styles.data, { color: colors.txt }]}>:   {item.Age}</Text>
                            </View>

                            <View style={styles.element}>
                                <Text style={[styles.heading, { color: colors.txt }]}>Contact </Text>
                                <Text style={[styles.data, { color: colors.txt }]}>:   {item.Contact}</Text>
                            </View>

                            <View style={styles.element}>
                                <Text style={[styles.heading, { color: colors.txt }]}>Gender </Text>
                                <Text style={[styles.data, { color: colors.txt }]}>:   {item.Gender}</Text>
                            </View>

                            <View style={styles.element}>
                                <Text style={[styles.heading, { color: colors.txt }]}>Address </Text>
                                <Text style={[styles.data, { color: colors.txt }]}>:   {item.Address}</Text>
                            </View>

                            <View style={styles.element}>
                                <Text style={[styles.heading, { color: colors.txt }]}>Visited Date</Text>
                                {item.VisitedDate && <Text style={[styles.data, { color: colors.txt }]}>:   {item.VisitedDate.slice(4, 15)}</Text>}
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ flexDirection: "row", flex: 1 }}>
                    <Picker style={{ flex: 1 }} selectedValue={id} onValueChange={(val) => { showPrescription(val), setId(val) }} style={[styles.prescription, { color: colors.txt }]}>
                        <Picker.Item label="Prescription" value="" style={styles.disabled}> </Picker.Item>
                        {prescriptionIds.map((item) => (
                            <Picker.Item key={item.PrescriptionId} label={item.PrescriptionId} value={item.PrescriptionId}></Picker.Item>
                        ))}
                    </Picker>
                    <View style={{ flex: 1, paddingRight: 50, alignItems: "flex-end" }}>
                        <Button title="compare" onPress={() => { setCompare(true), setShow2(false) }} />
                    </View>
                </View>

                {show &&
                    <View>
                        {prescription.map((item) => (
                            <View key={item.Name} style={styles.element}>
                                <Text style={{ flex: 1, fontSize: 20, color: colors.txt }}>{item.Name}</Text>
                                <Text style={{ flex: 1, fontSize: 20, color: colors.txt }}>:  {item.Value}</Text>
                            </View>
                        ))}

                    </View>

                }
            </ScrollView>
            <Modal animationType="slide" visible={compare}>
                <View style={{ flex: 1, backgroundColor: colors.back }}>
                    <View style={{ alignItems: "flex-end", padding: 10 }}>
                        <Ionicons name="close" size={40} onPress={() => { setCompare(false) }} color={colors.icon}></Ionicons>
                    </View>
                    <View style={{ flexDirection: "row", flex: 1 }}>
                        <View style={{ flex: 1, borderRightWidth: 1, borderLeftColor: colors.txt }}>
                            <Picker selectedValue={id} onValueChange={(val) => { showPrescription(val),setId(val) }} style={[styles.prescription, { color: colors.txt, width: "100%" }]}>
                                <Picker.Item label="Prescription" value="" style={styles.disabled}> </Picker.Item>
                                {prescriptionIds.map((item) => (
                                    <Picker.Item key={item.PrescriptionId} label={item.PrescriptionId} value={item.PrescriptionId}></Picker.Item>
                                ))}
                            </Picker>
                            {show &&
                                <View style={{flex : 1}}>
                                    {prescription.map((item) => (
                                        <View key={item.Name} style={{flexDirection : "row"}}>
                                            <Text style={{ flex: 1, fontSize: 20, color: colors.txt }}>{item.Name}</Text>
                                            <Text style={{ flex: 1, fontSize: 20, color: colors.txt }}>:  {item.Value}</Text>
                                        </View>
                                    ))}
                                </View>
                            }
                        </View>
                        <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: colors.txt }}>
                            <Picker onValueChange={(val) => { showPrescription2(val) }} style={[styles.prescription, { color: colors.txt, width: '100%' }]}>
                                <Picker.Item label="Prescription" value="" style={styles.disabled}> </Picker.Item>
                                {prescriptionIds.map((item) => (
                                    <Picker.Item key={item.PrescriptionId} label={item.PrescriptionId} value={item.PrescriptionId}></Picker.Item>
                                ))}
                            </Picker>
                            {show2 &&
                                <View style={{flex : 1}}>
                                    {prescription2.map((item) => (
                                        console.log(item.Name),
                                        <View key={item.Name} style={{flexDirection : "row"}}>
                                            <Text style={{ flex: 1, fontSize: 20, color: colors.txt }}>{item.Name}</Text>
                                            <Text style={{ flex: 1, fontSize: 20, color: colors.txt }}>:  {item.Value}</Text>
                                        </View>
                                    ))}
                                </View>
                            }
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    header:   {
        textAlign: 'center',
        fontSize: 25,
        backgroundColor: "#E78B5E",
        height: 50,
        paddingTop: 5,
    },
    element:   {
        padding: 10,
        flexDirection: 'row',
        flex:1
    },
    heading:   {
        fontSize: 20,
        flex:1
    },
    data:   {
        fontSize: 18,
        flex:2
    },
    prescription:   {
        width: "50%",
        paddingLeft: 6,
        height: 50,
        elevation: 5,
        borderWidth: 1,
        alignSelf: 'flex-start'
    },
    prescriptionData:   {
        flexDirection: 'row',
        padding: 10,
        flex: 1
    },
    row:   {
        flexDirection: 'row'
    },
    head:   {
        flexDirection: 'row',
        alignItems: 'center'
    },
    matter:   {
        flexDirection: 'row',
        paddingLeft: 20,
        alignItems: 'center'
    },
    text:   {
        fontSize: 20
    },
    table:   {
        marginLeft: '1%',
        borderWidth: 1,
        marginRight: '1%',
        height: 300,
        marginBottom: "10%"
    },
    tableData:   {
        flexDirection: 'row',
        height: 50
    },
    tableHeader:   {
        flexDirection: 'row',
        backgroundColor: 'black',
        height: 50
    },
    tableHeading:   {
        flex: 1,
        borderWidth: 1,
        paddingLeft: '1%',
        fontStyle: 'normal',
        color: 'white',
        borderRightColor: 'white',
    },
    tableElement:   {
        flex: 1,
        borderWidth: 1,
        paddingLeft: '1%',
        fontStyle: 'normal',
        color: 'black',
        borderRightColor: 'white',
    },
    disabled:   {
        fontSize: 14,
        borderWidth: 1,
        flex: 1,
        color: '#C1B8B9'
    }
})