import * as React from 'react';
import { useState, useEffect } from 'react'
import { Text, View, Button, Modal, Switch } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import ColorPicker from 'react-native-wheel-color-picker'
import Form from '../Screens/Prescription';
import PatientStack from '../routes/PatientStack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Pointing from '../Screens/Pointing'
import * as SQLite from 'expo-sqlite';

const Tab = createBottomTabNavigator()

const db = SQLite.openDatabase("Example.db")

db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
    console.log('Foreign keys turned on')
);

export default function Tabbar(props) {

    const [color, setColor] = useState('#DDDDDD')
    const [modal, setModal] = useState(false)
    const [backGround, setBackGround] = useState('#DDDDDD')
    const [iconColor, setIconColor] = useState('#E15009')
    const [textColor, setTextColor] = useState('#0A0A0A')
    const [cardColor, setCardColor] = useState('#D0CBCB')
    const [isEnabled, setIsEnabled] = useState(false);
    const [count, setCount] = useState(0)
    const [change, setChange] = useState(true)

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(`CREATE TABLE IF NOT EXISTS Patient(
              Name TEXT,
              Contact TEXT PRIMARY KEY,
              Age TEXT,
              Gender TEXT,
              Address TEXT,
              Reference TEXT,
              VisitedDate DATE
            );`, [], (data) => console.log("data" + data), (err) => console.log("err"))

            tx.executeSql(`CREATE TABLE IF NOT EXISTS Prescription(
              PrescriptionId TEXT NOT NULL PRIMARY KEY,
              PatientId TEXT REFERENCES Patient (Contact),
              Examination TEXT,
              VisitedDate DATE
          );
          `, [], (data) => console.log("data" + data), (err) => console.log(err))
        })
        if (count == 0) {
            getTheme()
        }
        else {
            storeData()
        }
        // storeData()
    }, [change])

    const getTheme = async () => {
        setCount(1)
        try {
            let color = JSON.parse(await AsyncStorage.getItem("theme"))
            setIsEnabled(color.darkmode)
            setBackGround(color.backGround)
            setIconColor(color.icon)
            setTextColor(color.text)
            setCardColor(color.card)
        } catch (e) {
            // remove error
        }
    }

    const toggleSwitch = () => {
        setIsEnabled(!isEnabled);
        if (isEnabled) {
            setBackGround('#FCFAFA')
            setTextColor('#0A0A0A')
            setCardColor('#B6AAAA')
        }
        else {
            setBackGround('#150909')
            setTextColor('#FFFFFF')
            setCardColor('#413434')
        }
        setChange(!change)
    }

    const storeData = async () => {
        let colorScheme = { "darkmode": isEnabled, "backGround": backGround, "icon": iconColor, "text": textColor, "card": cardColor }
        try {
            await AsyncStorage.setItem('theme', JSON.stringify(colorScheme))
        } catch (e) {

        }
    }

    const MyDarkTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            swipe: color,
            back: backGround,
            icon: iconColor,
            txt: textColor,
            crd: cardColor,
        }
    }

    const MyDefaultTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            swipe: color,
            back: backGround,
            icon: iconColor,
            txt: textColor,
            crd: cardColor,
        }
    }

    return (
        <NavigationContainer theme={isEnabled ? MyDarkTheme : MyDefaultTheme}>
            <Modal visible={modal}>
                <View style={{ alignItems: 'flex-end' }}>
                    <Ionicons name="close" size={40} onPress={() => { setModal(false), storeData() }}></Ionicons>
                </View>

                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ textAlign: 'center', fontSize: 20 }}>Back Ground </Text>
                                <ColorPicker style={{ margin: 20 }}
                                    onColorChangeComplete={(color) => (setColor(color), setBackGround(color))}
                                    color={backGround}
                                    swatches={false}
                                    thumbSize={20}
                                    sliderSize={20}
                                    noSnap={true}
                                    row={false}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ textAlign: 'center', fontSize: 20 }}>Icon Color </Text>
                                <ColorPicker style={{ margin: 20 }}
                                    onColorChangeComplete={(color) => (setIconColor(color))}
                                    color={iconColor}
                                    swatches={false}
                                    thumbSize={30}
                                    sliderSize={20}
                                    noSnap={true}
                                    row={false}
                                />
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ textAlign: 'center', fontSize: 20 }}>Text Color </Text>
                                    <ColorPicker style={{ margin: 20 }}
                                        onColorChangeComplete={(color) => (setTextColor(color))}
                                        color={textColor}
                                        swatches={false}
                                        thumbSize={20}
                                        sliderSize={20}
                                        noSnap={true}
                                        row={false}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ textAlign: 'center', fontSize: 20 }}>Card Color</Text>
                                    <ColorPicker style={{ margin: 20 }}
                                        onColorChangeComplete={(color) => (setCardColor(color))}
                                        color={cardColor}
                                        swatches={false}
                                        thumbSize={20}
                                        sliderSize={20}
                                        noSnap={true}
                                        row={false}
                                    />
                                </View>

                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let IconComponent = Ionicons;
                        let iconName;

                        if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home-outline';
                        }
                        else if (route.name === 'Patient') {
                            iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
                        }
                        else if (route.name === 'Acupunture') {
                            iconName = focused ? 'pin' : 'pin-outline';
                        }
                        return <IconComponent name={iconName} size={25} color={iconColor} />;
                    },
                    tabBarActiveTintColor: 'tomato',
                    tabBarInactiveTintColor: 'black',
                })}
            >
                <Tab.Screen name="Home" component={Form} options={{
                    headerRight: () => (
                        <View style={{ marginRight: 30, flexDirection: 'row' }}>
                            <Switch
                                trackColor={{ false: "grey", true: "grey" }}
                                thumbColor={isEnabled ? "white" : "black"}
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                            />
                            <MaterialCommunityIcons name="circle" size={40} color={color} onPress={() => { setModal(true) }}></MaterialCommunityIcons>
                        </View>
                    ),
                }} />
                <Tab.Screen name="Patient" component={PatientStack} options={{
                    headerRight: () => (
                        <View style={{ marginRight: 30, flexDirection: 'row' }}>
                            <Switch
                                trackColor={{ false: "grey", true: "grey" }}
                                thumbColor={isEnabled ? "white" : "black"}
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                            />
                            <MaterialCommunityIcons name="circle" size={40} color={color} onPress={() => { setModal(true) }}></MaterialCommunityIcons>
                        </View>
                    ),
                }} />
                <Tab.Screen name="Acupunture" component={Pointing} options={{
                    headerRight: () => (
                        <View style={{ marginRight: 30, flexDirection: 'row' }}>
                            <Switch
                                trackColor={{ false: "grey", true: "grey" }}
                                thumbColor={isEnabled ? "white" : "black"}
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                            />
                            <MaterialCommunityIcons name="circle" size={40} color={color} onPress={() => { setModal(true) }}></MaterialCommunityIcons>
                        </View>
                    ),
                }} />
            </Tab.Navigator>
        </NavigationContainer>
    )
}