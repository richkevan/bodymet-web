import { firebaseApp } from './firebase-app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firestoreDB = getFirestore(firebaseApp);

const getBPMMeasure = async (uid) => {
  let measure = [];
  const q = query(collection(firestoreDB, `Users/${uid}/withings_measure`), where("measure_types", "array-contains", 9));
  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.forEach((doc) => {
    measure.push(doc.data())
  });
  return measure;
};

const getWeightMeasure = async (uid) => {
  let measure = [];
  const q = query(collection(firestoreDB, `Users/${uid}/withings_measure`), where("measure_types", "array-contains", 1));
  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.forEach((doc) => {
    measure.push(doc.data())
  });
  return measure;
};

const getTemperatureMeasure = async (uid) => {
  let measure = [];
  const q = query(collection(firestoreDB, `Users/${uid}/withings_measure`), where("measure_types", "array-contains", 71));
  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.forEach((doc) => {
    measure.push(doc.data())
  });
  return measure;
}

const getMeasureRef = async () => {
  let refType = []
  const references = query(collection(firestoreDB, "withing_measurement_type_ref"))
  const refSnapshot = await getDocs(references)
  refSnapshot.forEach((doc) => {
    refType.push(doc.data())
  })
  return {references: refType}
}

export {
  getBPMMeasure,
  getWeightMeasure,
  getTemperatureMeasure,
  getMeasureRef
};