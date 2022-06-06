import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import Tab from './routes/Tabbar'

const db = SQLite.openDatabase("Example.db")

db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
  console.log('Foreign keys turned on')
);

export default function App() {

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
  }, [])

  return (
    <View style={styles.container}>
      <Tab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});
