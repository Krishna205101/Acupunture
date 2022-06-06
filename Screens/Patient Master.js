import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, TextInput, Button, Dimensions, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import * as Sqlite from 'expo-sqlite';
import { Formik } from 'formik';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import * as yup from 'yup';

const db = Sqlite.openDatabase("Example.db");

const Schema = yup.object({
    Name: yup.string().required(),
    Contact: yup.string().required()
})

const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
};

export default function Patient(props) {

    const [patientData, setPatientData] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedData, setSelectedData] = useState([])
    const [selected, setSelected] = useState(false)
    const [index, setIndex] = useState(0)
    const [screen, setScreen] = useState(Dimensions.get('window').width)
    const [id, setId] = useState('TM01')
    const [change, setChange] = useState(null)
    const [filteredPatientData, setFilteredPatientData] = useState([])
    const [search, setSearch] = useState('')
    const [prescriptions, setPrescriptions] = useState([])
    const { colors } = useTheme();
    const [pageNumbers, setPageNumbers] = useState(0)
    const [isloading, setIsloading] = useState(true)
    const visitedDate = new Date()
    const [refreshing, setRefreshing] = React.useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const pageItems = 10
    const indexOfLastItem = currentPage * pageItems
    const indexOfFirstItem = indexOfLastItem - pageItems
    const currentPosts = filteredPatientData.slice(indexOfFirstItem, indexOfLastItem)

    useEffect(() => {

        setIsloading(true)
        setPageNumbers([])

        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM Patient`, [], (_, { rows: { _array } }) => {
                setPatientData(_array);
                setFilteredPatientData(_array)
                setIsloading(false)
                setPageNumbers(Math.ceil(_array.length / pageItems))
                setPageNumbers(Math.ceil(_array.length / pageItems))
            })
        })

        Dimensions.addEventListener('change', () => {
            const dim = Dimensions.get("window")
            if (dim.width > dim.height) {
                setScreen(dim.width)
            }
            else {
                setScreen(dim.height)
            }
        });
    }, [change, refreshing])

    const handleDelete = (rowMap, rowKey) => {

        db.transaction((tx) => {
            tx.executeSql(`SELECT PrescriptionId from Prescription WHERE PatientId=?`, [rowKey], (_, { rows: { _array } }) => {
                setPrescriptions(_array)
            })
        })

        db.transaction((tx) => {
            for (let i = 0; i < prescriptions.length; i++) {
                tx.executeSql(`DELETE FROM PresRoga WHERE Prescription=?`, [prescriptions[i].PrescriptionId]);
                tx.executeSql(`DELETE FROM PresLaxanam WHERE Prescription=?`, [prescriptions[i].PrescriptionId]);
                tx.executeSql(`DELETE FROM PresSamprapti WHERE Prescription=?`, [prescriptions[i].PrescriptionId]);
                tx.executeSql(`DELETE FROM PresVishesha WHERE Prescription=?`, [prescriptions[i].PrescriptionId]);
                tx.executeSql(`DELETE FROM Receipt WHERE Prescription=?`, [prescriptions[i].PrescriptionId]);
            }
            tx.executeSql(`DELETE FROM Prescription WHERE PatientId=?`, [rowKey])
        })

        db.transaction((tx) => {
            tx.executeSql(`DELETE FROM Patient WHERE ID=?`, [rowKey], (data) => {
                Alert.alert('Success', 'Patient Information Deleted', [{ text: 'OK', onPress: () => { setChange(rowKey) } }])
            })
        })
    }

    const handleEdit = (data, rowMap, rowKey) => {
        setSelectedData(data.item)
        setIndex(patientData.findIndex((item) => item.Id == rowKey))
    }

    const searchData = (val) => {
        if (val) {
            const newData = patientData.filter(function (item) {
                const itemData = item.Name
                    ? item.Name.toUpperCase()
                    : ''.toUpperCase();
                const textData = val.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            setFilteredPatientData(newData);
            setSearch(val);
        } else {
            setFilteredPatientData(patientData);
            setSearch(val);
        }
    };

    const addUser = () => {
        setModalVisible(true);
        setSelected(false);
        setSelectedData([]);
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
    }, []);


    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.back }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

            <View style={styles.list}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.txt }]}>Patient Screen</Text>
                    <AntDesign name="adduser" size={24} color={colors.icon} onPress={() => { addUser() }} style={styles.add} />
                    {/* <AntDesign name="addfile" size={24} color="black" onPress={() => navigation.navigate('Details')}></AntDesign> */}
                </View>

                <TextInput style={styles.search} placeholder="search" onChangeText={(val) => searchData(val)} />

                <View style={{height : '60%'}}>
                    <View style={[styles.item, { backgroundColor: colors.crd }]}>
                        {/* <Text style={[styles.id, { color: colors.txt }]}>Id</Text> */}
                        <Text style={[styles.name, { color: colors.txt }]}>Name</Text>
                        <Text style={[styles.gender, { color: colors.txt }]}>Gender</Text>
                        <Text style={[styles.contact, { color: colors.txt }]}>Contact</Text>
                    </View>
                    {
                        isloading ? <ActivityIndicator size="large" color={colors.txt} />
                            :
                            <SwipeListView style={styles.swipe}
                                keyExtractor={(item) => item.Contact}
                                data={currentPosts}
                                renderItem={(data) => {
                                    return (
                                        <ScrollView style={styles.view}>
                                            <TouchableOpacity style={[styles.item, { backgroundColor: colors.crd }]} onPress={() => props.navigation.navigate('Details', { Id: data.item.Contact })}>
                                                {/* <Text style={[styles.id, { color: colors.txt }]}>{data.item.Id}</Text> */}
                                                <Text style={[styles.name, { color: colors.txt }]}>{data.item.Name}</Text>
                                                <Text style={[styles.gender, { color: colors.txt }]}>{data.item.Gender}</Text>
                                                <Text style={[styles.contact, { color: colors.txt }]}>{data.item.Contact}</Text>
                                            </TouchableOpacity>
                                        </ScrollView>
                                    )
                                }}
                                renderHiddenItem={(data, rowMap) => {
                                    return (
                                        <View style={styles.hidden}>
                                            {/* <Button style={styles.button} title="delete"></Button> */}
                                            <TouchableOpacity style={styles.delete} onPress={() => handleDelete(rowMap, data.item.Id)}>
                                                <Entypo name="trash" size={18}></Entypo>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.edit} onPress={() => { setModalVisible(true), handleEdit(data, rowMap, data.item.Id), setSelected(true) }}>
                                                <Entypo name="edit" size={18}></Entypo>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }}
                                leftOpenValue={screen / 2}
                                previewRowKey={"TM01"}
                                previewOpenValue={screen / 2}
                                previewOpenDelay={1500}
                                rightOpenValue={screen / 2}
                            />
                    }
                </View>
                <View style={styles.pagination}>
                    <Text style={{ padding: 15,color : colors.txt }}>Pages</Text>
                    {currentPage > 1 && <AntDesign name="leftsquareo" size={25} onPress={() => { setCurrentPage(currentPage - 1) }} style={{ padding: 6 }} color={colors.txt} />}
                    <Text style={{ fontSize: 25, color: colors.txt }}>{currentPage}</Text>
                    {currentPage < pageNumbers && <AntDesign name="rightsquareo" size={25} onPress={() => setCurrentPage(currentPage + 1)} style={{ padding: 6 }} color={colors.txt} />}
                </View>
            </View>



            <Modal animationType="slide" visible={modalVisible}>
                <ScrollView style={{ flex: 1, backgroundColor: colors.back }}>
                    <Formik
                        initialValues={{ Name: selectedData.Name, Age: selectedData.Age, Gender: selected ? selectedData.Gender : "Male", Address: selectedData.Address, Contact: selectedData.Contact }}
                        validationSchema={Schema}
                        onSubmit={(values) => {
                            if (selected) {
                                db.transaction((tx) => {
                                    tx.executeSql(`UPDATE Patient SET Name=?,Age=?,Gender=?,Address=?,Contact=? WHERE Id=?`, [values.Name, values.Age, values.Gender, values.Address, values.Contact, values.Id]
                                    )
                                })
                                setChange(values.Id)
                            }
                            else {
                                db.transaction((tx) => {
                                    tx.executeSql(`INSERT INTO Patient (
                                    Name,
                                    Age,
                                    Gender,
                                    Address,
                                    Contact,
                                    VisitedDate
                                )
                                VALUES (?,?,?,?,?,?,'${visitedDate}');`, [values.Id, values.Name, values.Age, values.Gender, values.Address, values.Contact]
                                    )
                                })
                            }
                            setModalVisible(false)
                            setChange(values.Id)
                        }}>
                        {(props) => (
                            <View>
                                <AntDesign style={styles.closeForm} name="closecircle" size={40} color={colors.icon} onPress={() => { setModalVisible(false), setSelected(false), setSelectedData([]) }} />
                                <View style={styles.form}>
                                    {/* <View style={styles.field}>
                                        <Text style={[styles.heading, { color: colors.txt }]}>Patient Id</Text>
                                        <Text style={[styles.input, { color: colors.txt }]}>{props.values.Id}</Text>
                                    </View> */}
                                    <View style={styles.field}>
                                        <Text style={[styles.heading, { color: colors.txt }]}>Patient Name</Text>
                                        <TextInput style={[styles.input, { backgroundColor: 'white' }]} placeholder="Patient Name" onChangeText={props.handleChange('Name')} value={props.values.Name} />
                                    </View>
                                    <Text style={{ color: "#FC040F", paddingLeft: 20 }}>{props.touched.Name && props.errors.Name}</Text>
                                    <View style={styles.field}>
                                        <Text style={[styles.heading, { color: colors.txt }]}>Age</Text>
                                        <TextInput style={[styles.input, { backgroundColor: 'white' }]} placeholder="Age" keyboardType="numeric" onChangeText={props.handleChange('Age')} value={props.values.Age} />
                                    </View >
                                    <View style={styles.field}>
                                        <Text style={[styles.heading, { color: colors.txt }]}>Gender</Text>
                                        <Picker style={[styles.input, { backgroundColor: 'white' }]} selectedValue={props.values.Gender}
                                            onValueChange={props.handleChange('Gender')}
                                        >
                                            <Picker.Item label="Male" value="Male" />
                                            <Picker.Item label="Female" value="Female" />
                                        </Picker>
                                    </View>
                                    <View style={styles.field}>
                                        <Text style={[styles.heading, { color: colors.txt }]}>Address</Text>
                                        <TextInput style={[styles.input, { backgroundColor: 'white' }]} placeholder="Address" onChangeText={props.handleChange('Address')} value={props.values.Address} />
                                    </View>
                                    <View style={styles.field}>
                                        <Text style={[styles.heading, { color: colors.txt }]}>Contact</Text>
                                        <TextInput style={[styles.input, { backgroundColor: 'white' }]} placeholder="Contact" onChangeText={props.handleChange('Contact')} value={props.values.Contact} />
                                    </View>
                                    <Button title="submit" color={colors.icon} onPress={props.handleSubmit} />
                                </View>
                            </View>
                        )}

                    </Formik>
                </ScrollView>
            </Modal>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        elevation: 10,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: '#333',
        shadowOpacity: 0.3,
        padding: 15,
        flexDirection: 'row'
    },
    title: {
        flex: 1,
        textAlign: 'left',
        fontSize: 20
    },
    add: {
        flex: 1,
        textAlign: 'right'
    },
    search: {
        paddingLeft: '80%',
    },
    view: {
        paddingBottom: 1
    },
    field: {
        flexDirection: 'row',
        padding: 10
    },
    item: {
        padding: 15,
        margin: 5,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    name: {
        flex: 1,
        textAlign: 'left'
    },
    id: {
        flex: 1,
        textAlign: 'left'
    },
    gender: {
        flex: 1,
        textAlign: 'left'
    },
    contact: {
        flex: 1,
        textAlign: 'left'
    },
    hidden: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        height: '100%',
    },
    button: {
        height: '100%'
    },
    delete: {
        backgroundColor: 'red',
        alignItems: "center",
        justifyContent: "center",
        height: '100%',
        width: '10%',
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    edit: {
        backgroundColor: '#C8C8C7',
        alignItems: "center",
        justifyContent: "center",
        height: '100%',
        width: '10%'
    },
    heading: {
        flex: 1,
        textAlign: 'left'
    },
    input: {
        flex: 1,
        textAlign: 'left',
        borderRadius: 10,
        height: 50
    },
    form: {
        margin: '5%'
    },
    closeForm: {
        textAlign: 'right',
        paddingTop: 50,
        paddingRight: 30
    },
    pagination: {
        flexDirection: 'row',
        paddingRight: "5%",
        justifyContent: "flex-end",
        paddingBottom: "3%",
        alignItems: "center"
    },
    card: {
        padding: 15,
        margin: 5,
        flexDirection: 'row',
    },
    list: {
        flex: 1,
        marginBottom: '22%'
    }
})