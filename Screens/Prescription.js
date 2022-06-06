import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView, Button, Dimensions, Alert } from 'react-native'
import { Formik } from 'formik';
import DatePicker from '@react-native-community/datetimepicker';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Sqlite from 'expo-sqlite'
import { useTheme } from '@react-navigation/native'

const db = Sqlite.openDatabase("Example.db")
const screen = Dimensions.get("screen").width > 425

export default function PatientForm(props) {

    const { colors } = useTheme()


    const [visited, setVisited] = useState(new Date());
    const [dateValue, setDateValue] = useState(visited.getDate() + '/' + visited.getMonth() + '/' + visited.getFullYear());
    const [picker, setPicker] = useState(false);

    const [patientData, setPatientData] = useState([]);
    const [save, setSave] = useState(false)
    const [id, setId] = useState('PM01');
    const [patient, setPatient] = useState({ Name: '', Age: '', Contact: '', Address: '', Gender: 'Male', Reference: '' })
    const [match, setMatch] = useState('NO')
    const [customFields, setCustomFields] = useState([])

    useEffect(() => {

        db.transaction((tx) => {

            tx.executeSql(`SELECT * FROM Patient`, [], (_, { rows: { _array } }) => {
                
                setPatientData(_array)
            })

            tx.executeSql(`SELECT * FROM Prescription`, [], (_, { rows: { _array } }) => {
                
                if (_array != 0) {
                    setId("PM0" + `${parseInt(_array[_array.length - 1].PrescriptionId.slice(3)) + 1}`)
                }
                else {
                    setId("PM01")
                }
            })
            
        })

        setSave(false)
        // setCustomFields([])

    }, [save,props.route.name])

    const change = (selectedDate) => {
        setPicker(false)
        if (selectedDate.type == "set") {
            const currentDate = selectedDate.nativeEvent.timestamp
            setVisited(currentDate)
            setDateValue(currentDate.getDate() + '/' + currentDate.getMonth() + '/' + currentDate.getFullYear())
        }
    }

    const check = (val) => {
        if (patientData.length > 0) {
            for (let i = 0; i < patientData.length; i++) {
                if (val == patientData[i].Contact) {
                    setPatient(patientData[i])
                    setMatch('YES')
                    break
                }
                else {
                    setPatient({ Name: '', Age: '', Contact: val, Address: '', Gender: 'Male', Reference: '' })
                    setMatch('NO')
                }
            }
        }
        else {
            setPatient({ Name: '', Age: '', Contact: val, Address: '', Gender: 'Male', Reference: '' })
        }
    }

    // const matching = (val) => {
    //     if (match == "NO") {
    //         setPatient({ ...patient, Name: val })
    //         setReset(false)
    //     }
    //     else {
    //         setPatient({ ...patient, Name: val })
    //     }
    // }

    const updateFieldName = index => e => {
        // console.log('index: ' + index);
        // console.log('property name: ' + e);
        let newArr = [...customFields]; // copying the old datas array
        // newArr[index] = e; // replace e.target.value with whatever you want to change it to
        // console.log(newArr[index].Name)
        newArr[index].Name = e
        // newArr[index].key = e

        setCustomFields(newArr);
    }

    const updateFieldValue = index => e => {
        // console.log('index: ' + index);
        // console.log('property name: ' + e);
        let newArr = [...customFields]; // copying the old datas array
        // newArr[index] = e; // replace e.target.value with whatever you want to change it to
        // console.log(newArr[index].Name)
        newArr[index].Value = e

        setCustomFields(newArr);
    }

    const addCustomField = () => {
        // console.log("Adding")
        setCustomFields((prev) => {
            return [
                ...prev,
                { Name: "", Value: "" }
            ]
        })
        // console.log(customFields)
    }

    const deleteCustomField = (name) => {
        console.log(name)
        setCustomFields((prev) => {
            return prev.filter(item => item.Name != name)
        })
    }

    const show = () => {
        console.log(JSON.parse("[{\"Name\":\"Bp\",\"Value\":\"180\"}]"))
        console.log(visited)
        console.log(patient)
        console.log(match)
    }

    const saveData = () => {
        let examination = JSON.stringify(customFields)
        // console.log(patient.Name)
        
        if (match == "NO") {
            db.transaction((tx) => {
                tx.executeSql(`INSERT INTO Patient (
                    Name,
                    Age,
                    Gender,
                    Address,
                    Contact,
                    Reference,
                    VisitedDate
                )
                VALUES (?,?,?,?,?,?,'${visited}');`, [patient.Name, patient.Age, patient.Gender, patient.Address, patient.Contact, patient.Reference],
                (data) => console.log("data"),(err) => console.log("err")
                )
            })
        }
        // else {
        //     db.transaction((tx) => {
        //         tx.executeSql(`UPDATE Patient SET Name=?,Age=?,Gender=?,Address=?,Contact=?,VisitedDate='${visited}' WHERE Contact=?`, [patient.Name, patient.Age, patient.Gender, patient.Address, patient.Contact, patient.Id],
        //             (data) => console.log('Patient Updated'), (err) => console.log('Patient Updation Error')
        //         )
        //     })
        // }

        db.transaction((tx) => {
            tx.executeSql(`INSERT INTO Prescription (
                PrescriptionId,
                PatientId,
                Examination,
                VisitedDate
            )
            VALUES ('${id}',?,?,'${visited}');`, [patient.Contact, examination],
                (data) => {
                    Alert.alert('Success', 'Prescription Saved',
                        [{ text: 'OK', onPress: () => { setSave(true), setPatientData(), setPatient({ Name: '', Age: '', Contact: '', Address: '', Gender: 'Male', Reference: '' }),setCustomFields([]) } }])
                },
                (err) => console.log("Prescription Error")
            )
        })
        // console.log(examination)
        // setSavedData(values)
    }

    return (
        <ScrollView style={styles.main}>
            <View style={[styles.container, { backgroundColor: colors.crd }]}>
                <View style={styles.subContainer}>
                    <Text style={{ color: colors.txt, fontSize: 20, fontWeight: "bold" }}>Patient</Text>
                    <View style={styles.patient}>
                        <View style={styles.rowFields}>
                            <View style={styles.field}>
                                <Text style={[styles.heading, { color: colors.txt }]}>Prescription Id</Text>
                                <Text style={styles.id}>{id}</Text>
                            </View>
                        </View>
                        <View style={styles.rowFields}>
                            <View style={styles.field}>
                                <TextInput style={styles.input} placeholder="Enter Phone" onChangeText={(val) => { check(val) }} value={patient.Contact} keyboardType='numeric' maxLength={10} />
                            </View>
                        </View>
                        <View style={styles.rowFields}>
                            <TextInput style={styles.input} placeholder="Enter Name" onChangeText={(val) => setPatient({ ...patient, Name: val })} value={patient.Name} />
                            <View style={styles.date}>
                                <Text style={[styles.today, { color: colors.txt, flex: 2 }]}>{dateValue}</Text>
                                <View style={{ flex: 1 }}>
                                    <AntDesign name="calendar" size={25} color={colors.txt} onPress={() => setPicker(true)} style={styles.calender} />
                                </View>
                                {picker && <DatePicker mode="date" value={visited} onChange={(val) => change(val)}></DatePicker>}
                            </View>
                        </View>
                        <View style={styles.rowFields}>
                            <TextInput style={styles.input} placeholder="Enter Age" value={patient.Age} keyboardType='numeric' onChangeText={(val) => setPatient({ ...patient, Age: val })} />
                            <Picker selectedValue={patient.Gender}
                                onValueChange={(val) => setPatient({ ...patient, Gender: val })} style={[styles.picker, { color: colors.txt }]}
                            >
                                <Picker.Item style={{ fontSize: 18 }} label="Male" value="Male" />
                                <Picker.Item style={{ fontSize: 18 }} label="Female" value="Female" />
                            </Picker>
                        </View>
                        <View style={styles.rowFields}>
                            <TextInput style={styles.input} placeholder="Enter Address" onChangeText={(val) => setPatient({ ...patient, Address: val })} value={patient.Address} />
                            <TextInput style={styles.input} placeholder="Enter Refernce" onChangeText={(val) => setPatient({ ...patient, Reference: val })} value={patient.Reference} />
                        </View>
                    </View>
                </View>
            </View>
            <View style={[styles.container, { backgroundColor: colors.crd }]}>
                <View style={styles.subContainer}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                        <Text style={{ flex: 2, fontSize: 20 }}>Examination</Text>
                        <Button style={{ flex: 1 }} title="Add" onPress={addCustomField}></Button>
                    </View>
                    {customFields.map((item, index) => (
                        <View key={index} style={styles.field}>
                            <TextInput style={styles.id} placeholder="Enter Field Name" value={item.Name} onChangeText={updateFieldName(index)} />
                            <TextInput style={styles.id} placeholder="Enter Field Value" value={item.Value} onChangeText={updateFieldValue(index)} />
                            <Ionicons name="close-circle" size={30} color="red" onPress={() => deleteCustomField(item.Name)}></Ionicons>
                            {/* <Ionicons name="close-circle" size={25} color="red" onPress={()=> console.log(item.key)}></Ionicons> */}
                        </View>
                    ))}
                </View>
            </View>
            <View style={{ flex: 1, justifyContent: "center", flexDirection: "row" }}>
                <Button title="save" onPress={saveData} />
            </View>
        </ScrollView >
    )
}

const styles = StyleSheet.create({
    form: {
        flexDirection: 'column'
    },
    input: {
        flex: 1,
        padding: 10,
        margin: 5,
        borderRadius: 15,
        backgroundColor: 'white',
        fontSize: 18
    },
    container: {
        flex: 1,
        elevation: 3,
        borderRadius: 10,
        shadowOpacity: 0.3,
        margin: 5,
        shadowRadius: 3
    },
    subContainer: {
        margin: 15,
        borderRadius: 5
    },
    rowFields: {
        flex: 1,
        flexDirection: 'row'
    },
    field: {
        flex: 1,
        flexDirection: 'row',
        alignItems: "center"
    },
    show: {
        flexDirection: 'row'
    },
    picker: {
        flex: 1
    },
    heading: {
        flex: 1,
        padding: 10,
        fontSize: 18
    },
    id: {
        flex: 1,
        padding: 10,
        borderRadius: 15,
        backgroundColor: 'white',
        fontSize: 18,
        margin: 5
    },
    date: {
        flex: 1,
        flexDirection: 'row',
        padding: 15,
        alignItems: "center"
    },
    today: {
        flex: 1,
        fontSize: 15
    },
    calender: {
        flex: 1
    }
})
